import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";

interface DeleteCategoryRequest {
  categoryId: number;
}

// Deletes a category and all its associated data.
export const deleteCategory = api<DeleteCategoryRequest, void>(
  { expose: true, method: "DELETE", path: "/categories/:categoryId" },
  async (req) => {
    // Check if category exists
    const category = await expenseDB.queryRow`
      SELECT id FROM categories WHERE id = ${req.categoryId}
    `;
    
    if (!category) {
      throw APIError.notFound("Category not found");
    }

    // Check if category has utilities
    const utilitiesCount = await expenseDB.queryRow<{ count: number }>`
      SELECT COUNT(*)::INTEGER as count FROM utilities WHERE category_id = ${req.categoryId}
    `;

    if (utilitiesCount && utilitiesCount.count > 0) {
      throw APIError.invalidArgument("Cannot delete category with existing utilities. Please delete all utilities first.");
    }

    // Delete category
    await expenseDB.exec`
      DELETE FROM categories WHERE id = ${req.categoryId}
    `;
  }
);
