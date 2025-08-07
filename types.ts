export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Utility {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  utilityType: 'simple' | 'installment' | 'bank_installment' | 'consumption' | 'annual_payment';
  config?: any;
  logoUrl?: string;
  createdAt: Date;
}

export interface Transaction {
  id: number;
  utilityId: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: Date;
  createdAt: Date;
}

export interface Installment {
  id: number;
  utilityId: number;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  paidAmount?: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
}

export interface ConsumptionReading {
  id: number;
  utilityId: number;
  readingDate: Date;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unit: string;
  totalAmount: number;
  createdAt: Date;
}

export interface PaymentNotification {
  id: number;
  utilityId: number;
  notificationType: 'installment_due' | 'annual_payment_due';
  dueDate: Date;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CategoryWithUtilities extends Category {
  utilities: Utility[];
}

export interface UtilityWithTransactions extends Utility {
  transactions: Transaction[];
  totalAmount: number;
}

export interface UtilityWithInstallments extends Utility {
  installments: Installment[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface UtilityWithConsumption extends Utility {
  consumptionReadings: ConsumptionReading[];
  lastReading?: ConsumptionReading;
  totalConsumption: number;
}
