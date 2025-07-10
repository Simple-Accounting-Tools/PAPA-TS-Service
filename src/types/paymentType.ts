import { Types } from 'mongoose';
import { QueryOptions } from './common';

export interface PaymentTypeAttributes {
    name: string;
    lastFour: string;
    clientId: Types.ObjectId;
}

export interface CreatePaymentTypeInput {
    name: string;
    lastFour: string;
    clientId: string;
}

export interface UpdatePaymentTypeInput extends Partial<CreatePaymentTypeInput> {}

export interface QueryPaymentTypeFilter {
    name?: string;
    clientId?: string;
}
