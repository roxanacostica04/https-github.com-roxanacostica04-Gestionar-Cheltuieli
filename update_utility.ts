import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Utility } from "./types";

interface UpdateUtilityRequest {
  utilityId: number;
  name: string;
  description?: string;
}

// Updates a utility's information.
export const updateUtility = api<UpdateUtilityRequest, Utility>(
  { expose: true, method: "PUT", path: "/utilities/:utilityId" },
  async (req) => {
    // Check if utility exists
    const existingUtility = await expenseDB.queryRow`
      SELECT id::INTEGER FROM utilities WHERE id = ${req.utilityId}
    `;
    
    if (!existingUtility) {
      throw APIError.notFound("Utility not found");
    }

    const utility = await expenseDB.queryRow<Utility>`
      UPDATE utilities 
      SET name = ${req.name}, description = ${req.description}
      WHERE id = ${req.utilityId}
      RETURNING id::INTEGER, category_id::INTEGER as "categoryId", name, description, 
                utility_type as "utilityType", config, created_at as "createdAt"
    `;

    return utility!;
  }
);
