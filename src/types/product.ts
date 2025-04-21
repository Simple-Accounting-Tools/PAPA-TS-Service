import { Types } from 'mongoose';

export interface ProductAttributes {
    name: string;
    description: string;
    vendorId: Types.ObjectId;
    clientId: Types.ObjectId;
}

export interface CreateProductInput {
    name: string;
    description?: string;
    vendorId: string;
    clientId: string;
}

export interface UpdateProductInput extends Partial<Omit<ProductAttributes, 'vendorId' | 'clientId'>> {}

export interface QueryProductsFilter {
    name?: string;
    clientId?: string;
    vendorId?: string;
}