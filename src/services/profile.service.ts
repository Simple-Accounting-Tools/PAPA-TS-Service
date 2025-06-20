import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { User, UserDocument } from '../models/user.model';
import {
    CreateUserInput,
    QueryUsersFilter,
    UpdateUserInput,
} from '../types/user';
import { QueryOptions } from '../types/common';
import { createUser, updateUserById, deleteUserById } from './user.service';

export interface QueryProfileOptions extends QueryOptions {
    fields?: string[];
}

/**
 * Create a user profile. Reuses createUser from user.service
 */
export const createProfile = createUser;

/**
 * Query user profiles with optional field selection
 */
export const queryProfiles = async (
    filter: QueryUsersFilter,
    options: QueryProfileOptions
): Promise<any> => {
    const { fields, ...paginateOptions } = options;
    const select = fields && fields.length > 0 ? fields.join(' ') : undefined;
    return User.paginate(filter, { ...paginateOptions, select });
};

/**
 * Get a user profile by ID with optional field selection
 */
export const getProfileById = async (
    id: string,
    fields?: string[]
): Promise<UserDocument> => {
    const query = fields && fields.length > 0
        ? User.findById(id).select(fields.join(' '))
        : User.findById(id);
    const user = await query;
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

/**
 * Update a user profile by ID
 */
export const updateProfileById = async (
    id: string,
    updateBody: UpdateUserInput
): Promise<UserDocument> => {
    return updateUserById(id, updateBody);
};

/**
 * Delete a user profile by ID
 */
export const deleteProfileById = async (id: string): Promise<void> => {
    return deleteUserById(id);
};
