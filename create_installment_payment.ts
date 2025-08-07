import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Installment } from "./types";

interface CreateInstallmentPaymentRequest {
  utilityId: number;
  totalAmount: number;
  installments: number;
  startDate: Date;
  description?: string;
}

interface CreateInstallmentPaymentResponse {
  installments: Installment[];
}

// Creates installment payments for utilities like CASCO insurance.
export const createInstallmentPayment = api<CreateInstallmentPaymentRequest, CreateInstallmentPaymentResponse>(
  { expose: true, method: "POST", path: "/installments" },
  async (req) => {
    // Validate utility exists and is of correct type
    const utility = await expenseDB.queryRow`
      SELECT id::INTEGER, utility_type, config FROM utilities WHERE id = ${req.utilityId}
    `;
    
    if (!utility) {
      throw APIError.notFound("Utility not found");
    }

    if (utility.utility_type !== 'installment' && utility.utility_type !== 'bank_installment') {
      throw APIError.invalidArgument("Utility does not support installment payments");
    }

    // Calculate installment amount
    const installmentAmount = req.totalAmount / req.installments;
    
    // Create installments
    const installments: Installment[] = [];
    
    for (let i = 1; i <= req.installments; i++) {
      const dueDate = new Date(req.startDate);
      
      if (utility.utility_type === 'installment') {
        // For CASCO - every 4 months
        const config = utility.config || { frequency_months: 4 };
        dueDate.setMonth(dueDate.getMonth() + (i - 1) * config.frequency_months);
      } else {
        // For bank installments - monthly
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
      }

      const installment = await expenseDB.queryRow<Installment>`
        INSERT INTO installments (utility_id, installment_number, total_installments, amount, due_date)
        VALUES (${req.utilityId}, ${i}, ${req.installments}, ${installmentAmount}, ${dueDate})
        RETURNING id::INTEGER, utility_id::INTEGER as "utilityId", 
                  installment_number::INTEGER as "installmentNumber", 
                  total_installments::INTEGER as "totalInstallments", 
                  amount::DOUBLE PRECISION, due_date as "dueDate", 
                  paid_date as "paidDate", paid_amount::DOUBLE PRECISION as "paidAmount", 
                  status, created_at as "createdAt"
      `;
      
      if (installment) {
        installments.push(installment);
      }
    }

    return { installments };
  }
);
