import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Transaction, PaymentNotification } from "./types";

interface CreateAnnualPaymentRequest {
  utilityId: number;
  amount: number;
  paymentDate: Date;
  yearsValid: number;
  description?: string;
}

interface CreateAnnualPaymentResponse {
  transaction: Transaction;
  notification?: PaymentNotification;
}

// Creates an annual payment and sets up future notifications.
export const createAnnualPayment = api<CreateAnnualPaymentRequest, CreateAnnualPaymentResponse>(
  { expose: true, method: "POST", path: "/annual-payments" },
  async (req) => {
    // Validate utility exists and is of correct type
    const utility = await expenseDB.queryRow`
      SELECT id::INTEGER, utility_type, config, name FROM utilities WHERE id = ${req.utilityId}
    `;
    
    if (!utility) {
      throw APIError.notFound("Utility not found");
    }

    if (utility.utility_type !== 'annual_payment') {
      throw APIError.invalidArgument("Utility does not support annual payments");
    }

    // Create transaction
    const description = req.description || `${utility.name} - ${req.yearsValid} ${req.yearsValid === 1 ? 'an' : 'ani'}`;
    
    const transaction = await expenseDB.queryRow<Transaction>`
      INSERT INTO transactions (utility_id, type, amount, description, date)
      VALUES (${req.utilityId}, 'expense', ${req.amount}, ${description}, ${req.paymentDate})
      RETURNING id::INTEGER, utility_id::INTEGER as "utilityId", type, 
                amount::DOUBLE PRECISION, description, date, created_at as "createdAt"
    `;

    // Calculate next payment due date
    const nextDueDate = new Date(req.paymentDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + req.yearsValid);

    // Calculate notification date (30 days before due date)
    const notificationDate = new Date(nextDueDate);
    notificationDate.setDate(notificationDate.getDate() - 30);

    // Create notification for next payment
    let notification = null;
    if (notificationDate > new Date()) {
      notification = await expenseDB.queryRow<PaymentNotification>`
        INSERT INTO payment_notifications (utility_id, notification_type, due_date, message)
        VALUES (${req.utilityId}, 'annual_payment_due', ${nextDueDate}, 
                ${`Plata pentru ${utility.name} expiră pe ${nextDueDate.toLocaleDateString('ro-RO')}`})
        RETURNING id::INTEGER, utility_id::INTEGER as "utilityId", 
                  notification_type as "notificationType", 
                  due_date as "dueDate", message, is_read as "isRead", 
                  created_at as "createdAt"
      `;
    }

    return { 
      transaction: transaction!,
      notification: notification || undefined
    };
  }
);
