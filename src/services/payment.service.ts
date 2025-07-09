import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { Payment, PaymentDocument } from '../models/payment.model';
import { Bill, Client, Vendor } from '../models';
import {saveAttachmentsFromRequest, deleteAttachments, saveAttachments} from './attachment.service';
import { calculateRemainingAmount, appendPaymentToBill, getBillById } from './bill.service';
import {CreatePaymentInput, UpdatePaymentInput, CreateMultiplePaymentsInput, PaymentItem} from "../types/payment";
// import { sendPaymentConfirmationEmail } from './email.service';

const applyDiscountRule = async (billId: string, currentPaymentAmount: number): Promise<{
    billId: string;
    daysSinceCreation: number;
    eligibleForDiscount: boolean;
    discount: number;
    finalPaymentAmount: number;
    status: 'paid' | 'unpaid';
}> => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
    const creationDate = new Date(bill.createdAt);
    const currentDate = new Date();
    const daysSinceCreation = Math.floor((currentDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
    let discount = 0;

    if (daysSinceCreation <= 10 && currentPaymentAmount >= bill.remainingAmount) {
        discount = bill.billAmount * 0.02;
    }

    const finalPaymentAmount = currentPaymentAmount - discount;
    const status: 'paid' | 'unpaid' = bill.remainingAmount - currentPaymentAmount <= 0 ? 'paid' : 'unpaid';

    return {
        billId: bill.id.toString(),
        daysSinceCreation,
        eligibleForDiscount: discount > 0,
        discount,
        finalPaymentAmount,
        status,
    };
};


export const createPayment = async (
    body: CreatePaymentInput,
    files?: Express.Multer.File[]
): Promise<PaymentDocument> => {
    const client = await Client.findById(body.clientId);
    const billData = await calculateRemainingAmount(body.bill);

    if (!client) throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    if (billData.status === 'paid') throw new ApiError(httpStatus.FORBIDDEN, 'Bill does not have any due amount');
    if (billData.remainingAmount < body.amount)
        throw new ApiError(httpStatus.FORBIDDEN, `Payment amount cannot exceed ${billData.remainingAmount}`);

    // only do this if files are present / not undefined
    if (files && files.length > 0) {
        let attachments = await saveAttachments(files);
        if (attachments && attachments.length > 0) body.attachments = attachments.map((a) => a.id.toString());
    }

    const paymentData = await applyDiscountRule(billData.billId, body.amount);
    body.amount = paymentData.finalPaymentAmount;
    body.discount = paymentData.discount;

    const payment = await Payment.create(body);
    await appendPaymentToBill(
        billData.billId,
        payment.id,
        billData.remainingAmount - payment.amount - payment.discount,
        paymentData.status
    );

    const bill = await getBillById(billData.billId);

    // purchaseOrder is an object ID not an object, so we'll need to use this to get the
    // vendor and poNumber from the actual Vendor and PurchaseOrder models
    /*const vendor = await Vendor.findById(bill?.purchaseOrder?.vendor?._id);
    if (vendor) {
      vendor.totalPaid += payment.amount;
      vendor.outstandingBalance -= payment.amount;
      if (payment.discount > 0) {
        vendor.outstandingBalance -= payment.discount;
      }
      await vendor.save();
    }

    /*const emailPaymentData = {
      poNumber: bill?.purchaseOrder?.poNumber,

      vendorName: vendor?.name,
      clientName: client?.name,
      paymentAmount: payment.amount,
      discount: payment.discount,
    };
    sendPaymentConfirmationEmail(vendor.email, emailPaymentData);*/


    return payment;
};

export const createPayments = async (
    body: CreateMultiplePaymentsInput,
    files?: Express.Multer.File[]
): Promise<PaymentDocument[]> => {
    const payments: PaymentDocument[] = [];
    const billsArray: PaymentItem[] = body.bills;

    for (const item of billsArray) {
        const paymentBody: CreatePaymentInput = {
            bill: item.bill,
            amount: item.amount,
            paymentMethod: body.paymentMethod,
            clientId: body.clientId,
            notes: body.notes,
        };

        const payment = await createPayment(paymentBody, files);
        payments.push(payment);
    }

    return payments;
};

export const queryPayments = async (filter: any, options: any) => {
    const { minAmount, maxAmount, ...newFilter } = filter;
    if (minAmount && maxAmount) newFilter.amount = { $gte: minAmount, $lte: maxAmount };
    else if (minAmount) newFilter.amount = { $gte: minAmount };
    else if (maxAmount) newFilter.amount = { $lte: maxAmount };
    return Payment.paginate(newFilter, { ...options, populate: 'bill attachments' });
};

export const getPaymentById = async (paymentId: string) => {
    const payment = await Payment.findById(paymentId)
        .populate({ path: 'bill', populate: { path: 'purchaseOrder', model: 'PurchaseOrder' } })
        .populate('attachments');
    if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    return payment;
};

export const updatePayment = async (
    paymentId: string,
    body: UpdatePaymentInput,
    files?: Express.Multer.File[]
): Promise<PaymentDocument> => {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');

    const deletedFiles = body.deletedFiles ?? [];

    if (deletedFiles.length > 0) {
        await deleteAttachments(deletedFiles);
        payment.attachments = payment.attachments?.filter(
            (attachment) => !deletedFiles.includes(attachment._id.toString())
        );
    }
    if (files && files.length > 0) {
        const newAttachments = await saveAttachments(files);
        if (newAttachments && newAttachments.length > 0) {
            payment.attachments?.push(...newAttachments.map((a) => a.id.toString()));
        }
    }

    Object.assign(payment, body);
    await payment.save();
    return payment;
};


export const deletePayment = async (paymentId: string) => {
    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    return payment;
};
