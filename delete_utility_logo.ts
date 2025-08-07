import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import { Bucket } from "encore.dev/storage/objects";

// Reference to the utility logos bucket
const utilityLogos = new Bucket("utility-logos", {
  public: true,
});

interface DeleteUtilityLogoRequest {
  utilityId: number;
}

// Deletes a utility's logo.
export const deleteUtilityLogo = api<DeleteUtilityLogoRequest, void>(
  { expose: true, method: "DELETE", path: "/utilities/:utilityId/logo" },
  async (req) => {
    // Get utility with logo URL
    const utility = await expenseDB.queryRow<{ logoUrl: string | null }>`
      SELECT logo_url as "logoUrl" FROM utilities WHERE id = ${req.utilityId}
    `;
    
    if (!utility) {
      throw APIError.notFound("Utility not found");
    }

    if (!utility.logoUrl) {
      throw APIError.notFound("Utility has no logo");
    }

    try {
      // Extract filename from URL
      const urlParts = utility.logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from bucket
      await utilityLogos.remove(fileName);

      // Remove logo URL from database
      await expenseDB.exec`
        UPDATE utilities 
        SET logo_url = NULL
        WHERE id = ${req.utilityId}
      `;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw APIError.internal("Failed to delete logo");
    }
  }
);
