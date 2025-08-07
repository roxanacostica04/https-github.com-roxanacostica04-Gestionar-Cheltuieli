import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import { Bucket } from "encore.dev/storage/objects";

// Create bucket for utility logos
const utilityLogos = new Bucket("utility-logos", {
  public: true,
});

interface UploadUtilityLogoRequest {
  utilityId: number;
  fileName: string;
  fileData: string; // Base64 encoded file data
}

interface UploadUtilityLogoResponse {
  logoUrl: string;
}

// Uploads a logo for a utility.
export const uploadUtilityLogo = api<UploadUtilityLogoRequest, UploadUtilityLogoResponse>(
  { expose: true, method: "POST", path: "/utilities/:utilityId/logo" },
  async (req) => {
    // Validate utility exists
    const utility = await expenseDB.queryRow`
      SELECT id::INTEGER FROM utilities WHERE id = ${req.utilityId}
    `;
    
    if (!utility) {
      throw APIError.notFound("Utility not found");
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const base64Data = req.fileData.split(',')[1] || req.fileData;
    const mimeType = req.fileData.split(',')[0]?.split(':')[1]?.split(';')[0];
    
    if (!mimeType || !allowedTypes.includes(mimeType)) {
      throw APIError.invalidArgument("Only image files are allowed (JPEG, PNG, GIF, WebP)");
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // Validate file size (max 5MB)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      throw APIError.invalidArgument("File size must be less than 5MB");
    }

    // Generate unique filename
    const fileExtension = req.fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `utility-${req.utilityId}-${Date.now()}.${fileExtension}`;

    try {
      // Upload to bucket
      await utilityLogos.upload(uniqueFileName, fileBuffer, {
        contentType: mimeType,
      });

      // Get public URL
      const logoUrl = utilityLogos.publicUrl(uniqueFileName);

      // Update utility with logo URL
      await expenseDB.exec`
        UPDATE utilities 
        SET logo_url = ${logoUrl}
        WHERE id = ${req.utilityId}
      `;

      return { logoUrl };
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw APIError.internal("Failed to upload logo");
    }
  }
);
