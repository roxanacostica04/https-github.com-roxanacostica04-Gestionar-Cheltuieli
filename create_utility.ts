import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Utility } from "./types";

interface CreateUtilityRequest {
  categoryId: number;
  name: string;
  description?: string;
}

// Creates a new utility within a category.
export const createUtility = api<CreateUtilityRequest, Utility>(
  { expose: true, method: "POST", path: "/utilities" },
  async (req) => {
    const utility = await expenseDB.queryRow<Utility>`
      INSERT INTO utilities (category_id, name, description, utility_type)
      VALUES (${req.categoryId}, ${req.name}, ${req.description}, 'simple')
      RETURNING id::INTEGER, category_id::INTEGER as "categoryId", name, description, 
                utility_type as "utilityType", config, created_at as "createdAt"
    `;

    return utility!;
  }
);
