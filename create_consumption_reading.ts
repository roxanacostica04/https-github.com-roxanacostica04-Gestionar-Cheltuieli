import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Category } from "./types";

interface CreateCategoryRequest {
  name: string;
  color: string;
  icon: string;
}

// Creates a new category.
export const createCategory = api<CreateCategoryRequest, Category>(
  { expose: true, method: "POST", path: "/categories" },
  async (req) => {
    const category = await expenseDB.queryRow<Category>`
      INSERT INTO categories (name, color, icon)
      VALUES (${req.name}, ${req.color}, ${req.icon})
      RETURNING id::INTEGER, name, color, icon, created_at as "createdAt"
    `;

    return category!;
  }
);
