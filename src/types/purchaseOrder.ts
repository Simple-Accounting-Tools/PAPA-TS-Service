import { Types } from 'mongoose';
import { QueryOptions } from './common';

export interface PurchaseOrderItem {
    product: Types.ObjectId;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface PurchaseOrderAttributes {
    poNumber?: string;
    vendor: Types.ObjectId;
    items: PurchaseOrderItem[];
    totalAmount: number;
    totalBilled?: number;
    status?: 'open' | 'partially-received' | 'fulfilled' | 'closed';
    createdBy: Types.ObjectId;
    notes?: string;
    attachments?: Types.ObjectId[];
    clientId: Types.ObjectId;
    shippingCost?: number;
    tax?: number;
}

export interface CreatePurchaseOrderInput {
    vendor: string;
    items: Array<{
        product: string;
        description?: string;
        quantity: number;
        rate: number;
    }>;
    totalAmount: number;
    status: string;
    notes?: string;
    createdBy: string;
    clientId: string;
    shippingCost?: number;
    tax?: number;
    attachments?: string[];
}

export interface UpdatePurchaseOrderInput
    extends Partial<Omit<PurchaseOrderAttributes, 'poNumber' | 'clientId' | 'createdBy' | 'totalBilled'>> {
    deletedFiles?: string[];
}

export interface QueryPurchaseOrdersFilter {
    vendor?: string;
    status?: string;
    totalAmount?: number;
    clientId?: string;
}