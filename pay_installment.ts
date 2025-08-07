import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Installment, Transaction } from "./types";

interface PayInstallmentRequest {
  installmentId: number;
  amount: number;
  paymentDate: Date;
  description?: string;
}

interface PayInstallmentResponse {
  installment: Installment;
  transaction: Transaction;
}

// Records payment for an installment.
export const payInstallment = api<PayInstallmentRequest, PayInstallmentResponse>(
  { expose: true, method: "POST", path: "/installments/:installmentId/pay" },
  async (req) => {
    // Get installment details
    const installment = await expenseDB.queryRow`
      SELECT id::INTEGER, utility_id::INTEGER, installment_number::INTEGER, 
             total_installments::INTEGER, amount::DOUBLE PRECISION, 
             due_date, paid_date, paid_amount::DOUBLE PRECISION, status, created_at
      FROM installments WHERE id = ${req.installmentId}
    `;
    
    if (!installment) {
      throw APIError.notFound("Installment not found");
    }

    if (installment.status === 'paid') {
      throw APIError.invalidArgument("Installment already paid");
    }

    // Update installment as paid
    const updatedInstallment = await expenseDB.queryRow<Installment>`
      UPDATE installments 
      SET paid_date = ${req.paymentDate}, paid_amount = ${req.amount}, status = 'paid'
      WHERE id = ${req.installmentId}
      RETURNING id::INTEGER, utility_id::INTEGER as "utilityId", 
                installment_number::INTEGER as "installmentNumber", 
                total_installments::INTEGER as "totalInstallments", 
                amount::DOUBLE PRECISION, due_date as "dueDate", 
                paid_date as "paidDate", paid_amount::DOUBLE PRECISION as "paidAmount", 
                status, created_at as "createdAt"
    `;

    // Create corresponding transaction
    const transaction = await expenseDB.queryRow<Transaction>`
      INSERT INTO transactions (utility_id, type, amount, description, date)
      VALUES (${installment.utility_id}, 'expense', ${req.amount}, 
              ${req.description || `Rată ${installment.installment_number}/${installment.total_installments}`}, 
              ${req.paymentDate})
      RETURNING id::INTEGER, utility_id::INTEGER as "utilityId", type, 
                amount::DOUBLE PRECISION, description, date, created_at as "createdAt"
    `;

    return { 
      installment: updatedInstallment!, 
      transaction: transaction! 
    };
  }
);
