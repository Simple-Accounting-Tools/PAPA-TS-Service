export interface PaymentFilter {
    bill?: string;
    status?: 'paid' | 'unpaid';
    paymentMethod?: 'card' | 'bank_transfer' | 'cash' | 'check' | 'ach' | 'wire_transfer';
    clientId?: string;
    minAmount?: number;
    maxAmount?: number;
}

export interface CreatePaymentInput {
    bill: string;
    amount: number;
    discount?: number;
    paymentMethod: string;
    status?: string;
    paymentDate?: Date;
    notes?: string;
    clientId: string;
    attachments?: string[];
}

export interface UpdatePaymentInput extends Partial<CreatePaymentInput> {
    deletedFiles?: string[];
}