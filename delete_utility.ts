import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";

interface DeleteUtilityRequest {
  utilityId: number;
}

// Deletes a utility and all its associated data.
export const deleteUtility = api<DeleteUtilityRequest, void>(
  { expose: true, method: "DELETE", path: "/utilities/:utilityId" },
  async (req) => {
    // Check if utility exists
    const utility = await expenseDB.queryRow`
      SELECT id FROM utilities WHERE id = ${req.utilityId}
    `;
    
    if (!utility) {
      throw APIError.notFound("Utility not found");
    }

    // Delete utility (cascading deletes will handle related data)
    await expenseDB.exec`
      DELETE FROM utilities WHERE id = ${req.utilityId}
    `;
  }
);
