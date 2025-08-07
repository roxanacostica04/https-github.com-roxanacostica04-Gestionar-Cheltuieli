import { api } from "encore.dev/api";
import { expenseDB } from "./db";

interface MarkNotificationReadRequest {
  notificationId: number;
}

// Marks a notification as read.
export const markNotificationRead = api<MarkNotificationReadRequest, void>(
  { expose: true, method: "POST", path: "/notifications/:notificationId/read" },
  async (req) => {
    await expenseDB.exec`
      UPDATE payment_notifications 
      SET is_read = TRUE 
      WHERE id = ${req.notificationId}
    `;
  }
);
