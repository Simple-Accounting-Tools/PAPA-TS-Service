import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { userService } from '../services';
import { QueryUsersFilter } from '../types/user';
import { QueryOptions } from '../types/common';

export const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const user = await userService.createUser(req.body);
        res.status(httpStatus.CREATED).send(user);
    }
);

export const getUsers = catchAsync(
    async (req: Request, res: Response) => {
        const filter = pick(req.query, ['name', 'role', 'email']) as QueryUsersFilter;
        const options = pick(req.query, ['sortBy', 'limit', 'page']) as QueryOptions;
        const result = await userService.queryUsers(filter, options);
        res.send(result);
    }
);

export const getUser = catchAsync(
    async (req: Request, res: Response) => {
        const user = await userService.getUserById(req.params.userId);
        res.send(user);
    }
);

export const updateUser = catchAsync(
    async (req: Request, res: Response) => {
        const user = await userService.updateUserById(req.params.userId, req.body);
        res.send(user);
    }
);

export const deleteUser = catchAsync(
    async (req: Request, res: Response) => {
        await userService.deleteUserById(req.params.userId);
        res.status(httpStatus.NO_CONTENT).send();
    }
);