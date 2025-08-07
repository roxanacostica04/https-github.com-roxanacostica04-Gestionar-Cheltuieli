import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Category } from "./types";

interface UpdateCategoryRequest {
  categoryId: number;
  name: string;
  color: string;
  icon: string;
}

// Updates a category's information.
export const updateCategory = api<UpdateCategoryRequest, Category>(
  { expose: true, method: "PUT", path: "/categories/:categoryId" },
  async (req) => {
    // Check if category exists
    const existingCategory = await expenseDB.queryRow`
      SELECT id::INTEGER FROM categories WHERE id = ${req.categoryId}
    `;
    
    if (!existingCategory) {
      throw APIError.notFound("Category not found");
    }

    const category = await expenseDB.queryRow<Category>`
      UPDATE categories 
      SET name = ${req.name}, color = ${req.color}, icon = ${req.icon}
      WHERE id = ${req.categoryId}
      RETURNING id::INTEGER, name, color, icon, created_at as "createdAt"
    `;

    return category!;
  }
);
