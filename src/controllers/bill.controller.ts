import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { billService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { Request, Response } from 'express';

export const createBill = catchAsync(async (req: Request, res: Response) => {
    const bill = await billService.createBill(req);
    res.status(httpStatus.CREATED).send({ bill });
});

export const getBills = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'clientId', 'vendorId', 'minAmount', 'maxAmount', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await billService.queryBills(filter, options);
    res.send(result);
});

export const getBillById = catchAsync(async (req: Request, res: Response) => {
    const bill = await billService.getBillById(req.params.billId);
    if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
    res.send({ bill });
});

export const updateBill = catchAsync(async (req: Request, res: Response) => {
    const bill = await billService.updateBill(req.params.billId, req.body, req);
    res.send(bill);
});

export const deleteBill = catchAsync(async (req: Request, res: Response) => {
    const bill = await billService.deleteBill(req.params.billId);
    res.send(bill);
});
