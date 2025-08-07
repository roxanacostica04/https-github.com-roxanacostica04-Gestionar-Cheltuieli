import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { PaymentNotification } from "./types";

interface GetNotificationsResponse {
  notifications: PaymentNotification[];
}

// Retrieves pending payment notifications.
export const getNotifications = api<void, GetNotificationsResponse>(
  { expose: true, method: "GET", path: "/notifications" },
  async () => {
    const notifications = await expenseDB.queryAll<PaymentNotification>`
      SELECT n.id::INTEGER, n.utility_id::INTEGER as "utilityId", 
             n.notification_type as "notificationType", 
             n.due_date as "dueDate", n.message, n.is_read as "isRead", 
             n.created_at as "createdAt"
      FROM payment_notifications n
      JOIN utilities u ON n.utility_id = u.id
      WHERE n.due_date >= CURRENT_DATE AND n.is_read = FALSE
      ORDER BY n.due_date ASC
    `;

    return { notifications };
  }
);
