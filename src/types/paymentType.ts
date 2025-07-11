import { Types } from 'mongoose';
import { QueryOptions } from './common';

export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_account';

export interface PaymentTypeAttributes {
    name: string;
    /** full card or account number */
    details: string;
    type: PaymentMethodType;
    clientId: Types.ObjectId;
}

export interface CreatePaymentTypeInput {
    name: string;
    /** full card or account number */
    details: string;
    type: PaymentMethodType;
    clientId: string;
}

export interface UpdatePaymentTypeInput extends Partial<CreatePaymentTypeInput> {}

export interface QueryPaymentTypeFilter {
    name?: string;
    type?: PaymentMethodType;
    clientId?: string;
}
