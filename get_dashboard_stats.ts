import { api } from "encore.dev/api";
import { expenseDB } from "./db";

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

// Retrieves dashboard statistics.
export const getDashboardStats = api<void, DashboardStats>(
  { expose: true, method: "GET", path: "/dashboard/stats" },
  async () => {
    // Get total income with explicit casting and COALESCE
    const incomeRows = await expenseDB.queryAll<{ total: number }>`
      SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
      FROM transactions
      WHERE type = 'income'
    `;
    const totalIncome = incomeRows.length > 0 ? incomeRows[0].total : 0;

    // Get total expenses with explicit casting and COALESCE
    const expenseRows = await expenseDB.queryAll<{ total: number }>`
      SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
      FROM transactions
      WHERE type = 'expense'
    `;
    const totalExpenses = expenseRows.length > 0 ? expenseRows[0].total : 0;

    // Get transaction count
    const countRows = await expenseDB.queryAll<{ count: number }>`
      SELECT COUNT(*)::INTEGER as count
      FROM transactions
    `;
    const transactionCount = countRows.length > 0 ? countRows[0].count : 0;

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount,
    };
  }
);
