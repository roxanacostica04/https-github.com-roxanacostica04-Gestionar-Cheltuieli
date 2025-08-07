import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { CategoryWithUtilities } from "./types";

interface ListCategoriesResponse {
  categories: CategoryWithUtilities[];
}

// Retrieves all categories with their utilities.
export const listCategories = api<void, ListCategoriesResponse>(
  { expose: true, method: "GET", path: "/categories" },
  async () => {
    const categories = await expenseDB.queryAll<CategoryWithUtilities>`
      SELECT id::INTEGER, name, color, icon, created_at as "createdAt"
      FROM categories
      ORDER BY name
    `;

    for (const category of categories) {
      const utilities = await expenseDB.queryAll`
        SELECT id::INTEGER, category_id::INTEGER as "categoryId", name, description, 
               utility_type as "utilityType", config, created_at as "createdAt"
        FROM utilities
        WHERE category_id = ${category.id}
        ORDER BY name
      `;
      category.utilities = utilities;
    }

    return { categories };
  }
);
