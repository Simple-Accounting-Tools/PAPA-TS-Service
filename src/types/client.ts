import { Types } from 'mongoose';

export interface ClientAttributes {
    name: string;
    contactName: string;
    phoneNumber: string;
    email: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    user: Types.ObjectId;
}

export interface CreateClientInput
    extends Omit<ClientAttributes, 'user'> {
    user: string; // passed as string
}

export interface UpdateClientInput
    extends Partial<Omit<ClientAttributes, 'user'>> {}

export interface QueryClientsFilter {
    name?: string;
    email?: string;
    user?: string;
}
