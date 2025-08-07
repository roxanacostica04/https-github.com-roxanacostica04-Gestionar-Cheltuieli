import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { UtilityWithInstallments } from "./types";

interface ListInstallmentsRequest {
  utilityId: number;
}

interface ListInstallmentsResponse {
  utility: UtilityWithInstallments;
}

// Retrieves installments for a utility.
export const listInstallments = api<ListInstallmentsRequest, ListInstallmentsResponse>(
  { expose: true, method: "GET", path: "/utilities/:utilityId/installments" },
  async (req) => {
    const utility = await expenseDB.queryRow<UtilityWithInstallments>`
      SELECT id::INTEGER, category_id::INTEGER as "categoryId", name, description, 
             utility_type as "utilityType", config, created_at as "createdAt"
      FROM utilities 
      WHERE id = ${req.utilityId}
    `;

    if (!utility) {
      throw new Error("Utility not found");
    }

    const installments = await expenseDB.queryAll`
      SELECT id::INTEGER, utility_id::INTEGER as "utilityId", 
             installment_number::INTEGER as "installmentNumber", 
             total_installments::INTEGER as "totalInstallments", 
             amount::DOUBLE PRECISION, due_date as "dueDate", 
             paid_date as "paidDate", paid_amount::DOUBLE PRECISION as "paidAmount", 
             status, created_at as "createdAt"
      FROM installments
      WHERE utility_id = ${req.utilityId}
      ORDER BY installment_number
    `;

    const totalAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
    const paidAmount = installments.reduce((sum, inst) => sum + (inst.paid_amount || 0), 0);

    utility.installments = installments;
    utility.totalAmount = totalAmount;
    utility.paidAmount = paidAmount;
    utility.remainingAmount = totalAmount - paidAmount;

    return { utility };
  }
);
