import { api } from "encore.dev/api";
import { expenseDB } from "./db";

interface CategoryTrendsRequest {
  categoryId?: number;
  months: number; // Number of months to look back
}

interface CategoryTrendData {
  categoryId: number;
  categoryName: string;
  monthlyData: {
    month: number;
    year: number;
    amount: number;
    transactionCount: number;
  }[];
  totalAmount: number;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CategoryTrendsResponse {
  categories: CategoryTrendData[];
}

// Retrieves category spending trends over time.
export const getCategoryTrends = api<CategoryTrendsRequest, CategoryTrendsResponse>(
  { expose: true, method: "GET", path: "/reports/category-trends" },
  async (req) => {
    const { categoryId, months } = req;
    
    // Calculate start date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    let categoriesQuery;
    if (categoryId) {
      categoriesQuery = await expenseDB.queryAll<{ id: number; name: string }>`
        SELECT id::INTEGER, name FROM categories WHERE id = ${categoryId}
      `;
    } else {
      categoriesQuery = await expenseDB.queryAll<{ id: number; name: string }>`
        SELECT id::INTEGER, name FROM categories ORDER BY name
      `;
    }

    const categories: CategoryTrendData[] = [];

    for (const category of categoriesQuery) {
      // Get monthly data for this category with explicit casting
      const monthlyData = await expenseDB.queryAll<{
        month: number;
        year: number;
        amount: number;
        transactionCount: number;
      }>`
        SELECT 
          EXTRACT(MONTH FROM t.date)::INTEGER as month,
          EXTRACT(YEAR FROM t.date)::INTEGER as year,
          COALESCE(SUM(t.amount), 0.0)::DOUBLE PRECISION as amount,
          COUNT(t.id)::INTEGER as "transactionCount"
        FROM transactions t
        JOIN utilities u ON t.utility_id = u.id
        WHERE u.category_id = ${category.id}
        AND t.type = 'expense'
        AND t.date >= ${startDate.toISOString().split('T')[0]}::DATE
        AND t.date <= ${endDate.toISOString().split('T')[0]}::DATE
        GROUP BY EXTRACT(YEAR FROM t.date), EXTRACT(MONTH FROM t.date)
        ORDER BY year, month
      `;

      const totalAmount = monthlyData.reduce((sum, data) => sum + data.amount, 0);
      const averageMonthly = monthlyData.length > 0 ? totalAmount / monthlyData.length : 0;

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (monthlyData.length >= 2) {
        const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
        const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, data) => sum + data.amount, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, data) => sum + data.amount, 0) / secondHalf.length;
        
        const changePercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
        
        if (changePercent > 10) {
          trend = 'increasing';
        } else if (changePercent < -10) {
          trend = 'decreasing';
        }
      }

      categories.push({
        categoryId: category.id,
        categoryName: category.name,
        monthlyData,
        totalAmount,
        averageMonthly,
        trend
      });
    }

    return { categories };
  }
);
