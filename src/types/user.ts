import { Types } from 'mongoose';
import { QueryOptions } from './common';

/**
 * Address subdocument for mailingAddress
 */
export interface MailingAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

/**
 * Core user attributes stored in MongoDB
 */
export interface UserAttributes {
    name: string;
    email: string;
    password: string;
    role: string;
    isEmailVerified: boolean;
    mailingAddress?: MailingAddress;
    website?: string;
    phoneNumber?: string;
}


/**
 * Input for creating a new user
 */
export interface CreateUserInput extends Omit<UserAttributes, 'isEmailVerified'> {
    // isEmailVerified set by system
}

/**
 * Input for updating an existing user
 */
export interface UpdateUserInput extends Partial<Omit<UserAttributes, 'password'>> {
    password?: string;
}

/**
 * Filterable fields for querying users
 */
export interface QueryUsersFilter {
    name?: string;
    role?: string;
    email?: string;
}
