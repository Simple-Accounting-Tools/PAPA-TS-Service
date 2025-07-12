import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { paymentService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { CreatePaymentInput, UpdatePaymentInput, PaymentFilter } from '../types/payment';

export const createPayment = catchAsync(async (req: Request, res: Response) => {
    const files = (req as any).files;
    const rawBody = req.body as any;

    if (rawBody.bills) {
        const bills = typeof rawBody.bills === 'string' ? JSON.parse(rawBody.bills) : rawBody.bills;
        const payments = await paymentService.createPayments(
            {
                bills,
                paymentMethod: rawBody.paymentMethod,
                paymentType: rawBody.paymentType,
                clientId: rawBody.clientId,
                notes: rawBody.notes,
            },
            files
        );
        res.status(httpStatus.CREATED).send({ payments });
        return;
    }

    const body = rawBody as CreatePaymentInput;
    const payment = await paymentService.createPayment(body, files);
    res.status(httpStatus.CREATED).send({ payment });
});

export const getPayments = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['bill', 'status', 'paymentMethod', 'paymentType', 'clientId', 'minAmount', 'maxAmount']) as PaymentFilter;
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await paymentService.queryPayments(filter, options);
    res.send({ docs: result.docs, ...result });
});

export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentById(paymentId);
    if (!payment) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }
    res.send({ payment });
});

export const updatePayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const body = req.body as UpdatePaymentInput;
    const files = (req as any).files;
    const payment = await paymentService.updatePayment(paymentId, body, files);

    res.send({ payment });
});

export const deletePayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    await paymentService.deletePayment(paymentId);
    res.status(httpStatus.OK).send();
});