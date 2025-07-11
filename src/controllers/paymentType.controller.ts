import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { paymentTypeService } from '../services';
import pick from '../utils/pick';
import { QueryPaymentTypeFilter, CreatePaymentTypeInput, UpdatePaymentTypeInput } from '../types/paymentType';
import { QueryOptions } from '../types/common';

export const createPaymentType = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as CreatePaymentTypeInput;
    const paymentType = await paymentTypeService.createPaymentType(body);
    res.status(httpStatus.CREATED).send({ paymentType });
});

export const getPaymentTypes = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'type', 'clientId']) as QueryPaymentTypeFilter;
    const options = pick(req.query, ['sortBy', 'limit', 'page']) as QueryOptions;
    const result = await paymentTypeService.queryPaymentTypes(filter, options);
    res.send(result);
});

export const getPaymentTypeById = catchAsync(async (req: Request, res: Response) => {
    const paymentType = await paymentTypeService.getPaymentTypeById(req.params.id);
    res.send({ paymentType });
});

export const updatePaymentType = catchAsync(async (req: Request, res: Response) => {
    const paymentType = await paymentTypeService.updatePaymentType(req.params.id, req.body as UpdatePaymentTypeInput);
    res.send({ paymentType });
});

export const deletePaymentType = catchAsync(async (req: Request, res: Response) => {
    await paymentTypeService.deletePaymentType(req.params.id);
    res.status(httpStatus.OK).send();
});
