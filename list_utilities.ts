import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { UtilityWithTransactions } from "./types";

interface ListUtilitiesRequest {
  categoryId: number;
}

interface ListUtilitiesResponse {
  utilities: UtilityWithTransactions[];
}

// Retrieves all utilities for a category with their transactions.
export const listUtilities = api<ListUtilitiesRequest, ListUtilitiesResponse>(
  { expose: true, method: "GET", path: "/categories/:categoryId/utilities" },
  async (req) => {
    const utilities = await expenseDB.queryAll<UtilityWithTransactions>`
      SELECT id::INTEGER, category_id::INTEGER as "categoryId", name, description, 
             utility_type as "utilityType", config, logo_url as "logoUrl", created_at as "createdAt"
      FROM utilities
      WHERE category_id = ${req.categoryId}
      ORDER BY name
    `;

    for (const utility of utilities) {
      const transactions = await expenseDB.queryAll`
        SELECT id::INTEGER, utility_id::INTEGER as "utilityId", type, 
               amount::DOUBLE PRECISION, description, date, created_at as "createdAt"
        FROM transactions
        WHERE utility_id = ${utility.id}
        ORDER BY date DESC
      `;
      
      // Get total amount with explicit casting and COALESCE
      const totalRows = await expenseDB.queryAll<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
        FROM transactions
        WHERE utility_id = ${utility.id}
      `;
      const totalAmount = totalRows.length > 0 ? totalRows[0].total : 0;

      utility.transactions = transactions;
      utility.totalAmount = totalAmount;
    }

    return { utilities };
  }
);
