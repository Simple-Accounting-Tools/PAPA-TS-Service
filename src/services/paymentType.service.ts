import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { PaymentType, PaymentTypeDocument } from '../models/paymentType.model';
import { Client } from '../models/client.model';
import {
    CreatePaymentTypeInput,
    UpdatePaymentTypeInput,
    QueryPaymentTypeFilter,
} from '../types/paymentType';
import { QueryOptions } from '../types/common';

export const createPaymentType = async (
    body: CreatePaymentTypeInput
): Promise<PaymentTypeDocument> => {
    const client = await Client.findById(body.clientId);
    if (!client) throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    return PaymentType.create(body);
};

export const queryPaymentTypes = async (
    filter: QueryPaymentTypeFilter,
    options: QueryOptions
) => {
    const newFilter: any = {};
    if (filter.name) newFilter.name = { $regex: new RegExp(filter.name, 'i') };
    if (filter.type) newFilter.type = filter.type;
    if (filter.clientId) newFilter.clientId = filter.clientId;
    return PaymentType.paginate(newFilter, options);
};

export const getPaymentTypeById = async (
    id: string
): Promise<PaymentTypeDocument> => {
    const paymentType = await PaymentType.findById(id);
    if (!paymentType) throw new ApiError(httpStatus.NOT_FOUND, 'Payment type not found');
    return paymentType;
};

export const updatePaymentType = async (
    id: string,
    updateBody: UpdatePaymentTypeInput
): Promise<PaymentTypeDocument> => {
    const paymentType = await PaymentType.findById(id);
    if (!paymentType) throw new ApiError(httpStatus.NOT_FOUND, 'Payment type not found');
    Object.assign(paymentType, updateBody);
    await paymentType.save();
    return paymentType;
};

export const deletePaymentType = async (id: string): Promise<void> => {
    const removed = await PaymentType.findByIdAndDelete(id);
    if (!removed) throw new ApiError(httpStatus.NOT_FOUND, 'Payment type not found');
};
