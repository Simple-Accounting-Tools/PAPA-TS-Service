import { Types } from 'mongoose';
import { QueryOptions } from './common';

// Attributes stored in MongoDB
export interface VendorAttributes {
    name: string;
    email: string;
    phoneNumber?: string;
    netTerms?: string;
    notes?: string;
    attachments?: Types.ObjectId[];
    deletedFiles?: string[];
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    clientId: Types.ObjectId;
}

// Input payload for creating a new vendor
export interface CreateVendorInput {
    name: string;
    email: string;
    phoneNumber?: string;
    netTerms?: string;
    notes?: string;
    attachments?: string[];
    deletedFiles?: string[];
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    clientId: string;
}

// Input payload for updating a vendor
export interface UpdateVendorInput
    extends Partial<Omit<VendorAttributes, 'clientId'>> {
    deletedFiles?: string[];
}

// Filterable fields for vendor queries
export interface QueryVendorsFilter {
    name?: string;
    clientId?: string;
}
