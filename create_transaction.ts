import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Transaction } from "./types";

interface CreateTransactionRequest {
  utilityId: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: Date;
}

// Creates a new transaction for a utility.
export const createTransaction = api<CreateTransactionRequest, Transaction>(
  { expose: true, method: "POST", path: "/transactions" },
  async (req) => {
    const transaction = await expenseDB.queryRow<Transaction>`
      INSERT INTO transactions (utility_id, type, amount, description, date)
      VALUES (${req.utilityId}, ${req.type}, ${req.amount}, ${req.description}, ${req.date})
      RETURNING id::INTEGER, utility_id::INTEGER as "utilityId", type, 
                amount::DOUBLE PRECISION, description, date, created_at as "createdAt"
    `;

    return transaction!;
  }
);
