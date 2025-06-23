import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { profileService } from '../services';
import { QueryUsersFilter } from '../types/user';
import { QueryProfileOptions } from '../services/profile.service';

export const createProfile = catchAsync(
    async (req: Request, res: Response) => {
        const profile = await profileService.createProfile(req.body);
        res.status(httpStatus.CREATED).send(profile);
    }
);

export const getProfiles = catchAsync(
    async (req: Request, res: Response) => {
        const filter = pick(req.query, ['name', 'role', 'email']) as QueryUsersFilter;
        const baseOptions = pick(req.query, ['sortBy', 'limit', 'page']) as QueryProfileOptions;
        const fields = typeof req.query.fields === 'string'
            ? req.query.fields.split(',').map((f) => f.trim())
            : undefined;
        const options: QueryProfileOptions = { ...baseOptions, fields };
        const result = await profileService.queryProfiles(filter, options);
        res.send(result);
    }
);

export const getProfile = catchAsync(
    async (req: Request, res: Response) => {
        const fields = typeof req.query.fields === 'string'
            ? req.query.fields.split(',').map((f) => f.trim())
            : undefined;
        const profile = await profileService.getProfileById(req.params.profileId, fields);
        res.send(profile);
    }
);

export const updateProfile = catchAsync(
    async (req: Request, res: Response) => {
        const profile = await profileService.updateProfileById(req.params.profileId, req.body);
        res.send(profile);
    }
);

export const deleteProfile = catchAsync(
    async (req: Request, res: Response) => {
        await profileService.deleteProfileById(req.params.profileId);
        res.status(httpStatus.NO_CONTENT).send();
    }
);
