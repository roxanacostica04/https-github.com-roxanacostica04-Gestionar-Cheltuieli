import { api } from "encore.dev/api";
import { expenseDB } from "./db";

interface MonthlyStatsRequest {
  year: number;
  month?: number;
}

interface MonthlyStats {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    percentage: number;
  }[];
}

interface MonthlyStatsResponse {
  stats: MonthlyStats[];
}

// Retrieves monthly statistics for reports.
export const getMonthlyStats = api<MonthlyStatsRequest, MonthlyStatsResponse>(
  { expose: true, method: "GET", path: "/reports/monthly" },
  async (req) => {
    const { year, month } = req;
    
    let monthsToQuery: number[];
    if (month) {
      monthsToQuery = [month];
    } else {
      monthsToQuery = Array.from({ length: 12 }, (_, i) => i + 1);
    }

    const stats: MonthlyStats[] = [];

    for (const currentMonth of monthsToQuery) {
      // Get income for the month with explicit casting and COALESCE
      const incomeRows = await expenseDB.queryAll<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
        FROM transactions
        WHERE type = 'income' 
        AND EXTRACT(YEAR FROM date)::INTEGER = ${year}
        AND EXTRACT(MONTH FROM date)::INTEGER = ${currentMonth}
      `;
      const totalIncome = incomeRows.length > 0 ? incomeRows[0].total : 0;

      // Get expenses for the month with explicit casting and COALESCE
      const expenseRows = await expenseDB.queryAll<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
        FROM transactions
        WHERE type = 'expense'
        AND EXTRACT(YEAR FROM date)::INTEGER = ${year}
        AND EXTRACT(MONTH FROM date)::INTEGER = ${currentMonth}
      `;
      const totalExpenses = expenseRows.length > 0 ? expenseRows[0].total : 0;

      // Get transaction count
      const countRows = await expenseDB.queryAll<{ count: number }>`
        SELECT COUNT(*)::INTEGER as count
        FROM transactions
        WHERE EXTRACT(YEAR FROM date)::INTEGER = ${year}
        AND EXTRACT(MONTH FROM date)::INTEGER = ${currentMonth}
      `;
      const transactionCount = countRows.length > 0 ? countRows[0].count : 0;

      // Get category breakdown for expenses with explicit casting
      const categoryBreakdown = await expenseDB.queryAll<{
        categoryId: number;
        categoryName: string;
        totalAmount: number;
      }>`
        SELECT 
          c.id::INTEGER as "categoryId",
          c.name as "categoryName",
          COALESCE(SUM(t.amount), 0.0)::DOUBLE PRECISION as "totalAmount"
        FROM categories c
        LEFT JOIN utilities u ON c.id = u.category_id
        LEFT JOIN transactions t ON u.id = t.utility_id 
          AND t.type = 'expense'
          AND EXTRACT(YEAR FROM t.date)::INTEGER = ${year}
          AND EXTRACT(MONTH FROM t.date)::INTEGER = ${currentMonth}
        GROUP BY c.id, c.name
        HAVING COALESCE(SUM(t.amount), 0.0)::DOUBLE PRECISION > 0.0
        ORDER BY "totalAmount" DESC
      `;

      const totalCategoryExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.totalAmount, 0);

      stats.push({
        month: currentMonth,
        year,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount,
        categoryBreakdown: categoryBreakdown.map(cat => ({
          ...cat,
          percentage: totalCategoryExpenses > 0 ? (cat.totalAmount / totalCategoryExpenses) * 100 : 0
        }))
      });
    }

    return { stats };
  }
);
