import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { User, UserDocument } from '../models/user.model';
import {
    CreateUserInput,
    QueryUsersFilter,
    UpdateUserInput,
} from '../types/user';
import { QueryOptions } from '../types/common';

/**
 * Create a new user
 */
export const createUser = async (
    body: CreateUserInput
): Promise<UserDocument> => {
    if (await User.isEmailTaken(body.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    return User.create(body);
};

/**
 * Query users with filters & pagination
 */
export const queryUsers = async (
    filter: QueryUsersFilter,
    options: QueryOptions
): Promise<any> => {
    return User.paginate(filter, options);
};

/**
 * Get user by ID
 */
export const getUserById = async (
    id: string
): Promise<UserDocument> => {
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

/**
 * Update user by ID
 */
export const updateUserById = async (
    id: string,
    updateBody: UpdateUserInput
): Promise<UserDocument> => {
    const user = await getUserById(id);
    if (updateBody.email && (await User.isEmailTaken(updateBody.email, id))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

/**
 * Delete user by ID
 */
export const deleteUserById = async (
    id: string
): Promise<void> => {
    const user = await getUserById(id);
    await user.deleteOne();
};
