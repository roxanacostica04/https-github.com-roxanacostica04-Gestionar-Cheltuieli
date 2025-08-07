import { api } from "encore.dev/api";
import { expenseDB } from "./db";

interface YearlyComparisonRequest {
  startYear: number;
  endYear: number;
}

interface YearlyStats {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageMonthlyExpense: number;
  topCategory: {
    name: string;
    amount: number;
  } | null;
}

interface YearlyComparisonResponse {
  years: YearlyStats[];
  trends: {
    incomeGrowth: number;
    expenseGrowth: number;
    balanceImprovement: number;
  };
}

// Retrieves yearly comparison statistics.
export const getYearlyComparison = api<YearlyComparisonRequest, YearlyComparisonResponse>(
  { expose: true, method: "GET", path: "/reports/yearly" },
  async (req) => {
    const { startYear, endYear } = req;
    const years: YearlyStats[] = [];

    for (let year = startYear; year <= endYear; year++) {
      // Get income for the year with explicit casting and COALESCE
      const incomeRows = await expenseDB.queryAll<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
        FROM transactions
        WHERE type = 'income' 
        AND EXTRACT(YEAR FROM date)::INTEGER = ${year}
      `;
      const totalIncome = incomeRows.length > 0 ? incomeRows[0].total : 0;

      // Get expenses for the year with explicit casting and COALESCE
      const expenseRows = await expenseDB.queryAll<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0.0)::DOUBLE PRECISION as total
        FROM transactions
        WHERE type = 'expense'
        AND EXTRACT(YEAR FROM date)::INTEGER = ${year}
      `;
      const totalExpenses = expenseRows.length > 0 ? expenseRows[0].total : 0;

      // Get transaction count
      const countRows = await expenseDB.queryAll<{ count: number }>`
        SELECT COUNT(*)::INTEGER as count
        FROM transactions
        WHERE EXTRACT(YEAR FROM date)::INTEGER = ${year}
      `;
      const transactionCount = countRows.length > 0 ? countRows[0].count : 0;

      // Get top category for the year with explicit casting
      const topCategoryRows = await expenseDB.queryAll<{
        categoryName: string;
        totalAmount: number;
      }>`
        SELECT 
          c.name as "categoryName",
          SUM(t.amount)::DOUBLE PRECISION as "totalAmount"
        FROM categories c
        JOIN utilities u ON c.id = u.category_id
        JOIN transactions t ON u.id = t.utility_id 
        WHERE t.type = 'expense'
        AND EXTRACT(YEAR FROM t.date)::INTEGER = ${year}
        GROUP BY c.id, c.name
        ORDER BY "totalAmount" DESC
        LIMIT 1
      `;

      const topCategory = topCategoryRows.length > 0 ? {
        name: topCategoryRows[0].categoryName,
        amount: topCategoryRows[0].totalAmount
      } : null;

      years.push({
        year,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount,
        averageMonthlyExpense: totalExpenses / 12,
        topCategory
      });
    }

    // Calculate trends
    let trends = {
      incomeGrowth: 0,
      expenseGrowth: 0,
      balanceImprovement: 0
    };

    if (years.length >= 2) {
      const firstYear = years[0];
      const lastYear = years[years.length - 1];

      if (firstYear.totalIncome > 0) {
        trends.incomeGrowth = ((lastYear.totalIncome - firstYear.totalIncome) / firstYear.totalIncome) * 100;
      }
      
      if (firstYear.totalExpenses > 0) {
        trends.expenseGrowth = ((lastYear.totalExpenses - firstYear.totalExpenses) / firstYear.totalExpenses) * 100;
      }

      trends.balanceImprovement = lastYear.balance - firstYear.balance;
    }

    return { years, trends };
  }
);
