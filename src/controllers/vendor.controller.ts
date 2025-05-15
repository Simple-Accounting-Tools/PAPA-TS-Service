import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { vendorService } from '../services';
import { QueryVendorsFilter } from '../types/vendor';
import { QueryOptions } from '../types/common';

export const createVendor = catchAsync(async (req: Request, res: Response) => {
    const vendor = await vendorService.createVendor(req.body);
    res.status(httpStatus.CREATED).send({ vendor });
});

export const getVendors = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'clientId']) as QueryVendorsFilter;
    const options = pick(req.query, [
        'sortBy',
        'limit',
        'page',
    ]) as QueryOptions;
    const result = await vendorService.queryVendors(filter, options);
    res.send(result);
});

export const getVendorById = catchAsync(async (req: Request, res: Response) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.send({ vendor });
});

export const updateVendor = catchAsync(async (req: Request, res: Response) => {
    const vendor = await vendorService.updateVendor(req.params.id, req.body);
    res.send({ vendor });
});

export const deleteVendor = catchAsync(async (req: Request, res: Response) => {
    await vendorService.deleteVendor(req.params.id);
    res.status(httpStatus.OK).send();
});
