import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { Bill, BillDocument } from '../models/bill.model';
import { Client } from '../models/client.model';
import { purchaseOrderService } from '.';
import { QueryOptions } from '../types/common';
import mongoose from "mongoose";

export const createBill = async (req: Request): Promise<BillDocument> => {
    const { clientId, purchaseOrder: poId, billAmount, ...rest } = req.body;

    // 1. Validate client exists
    const client = await Client.findById(clientId);

    if (!client) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }

    // 2. Validate PO exists (but do NOT modify it here)
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(poId);

    if (!purchaseOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
    }

    // 3. Create the Bill record
    const billData: Partial<BillDocument> = {
        purchaseOrder: poId,
        clientId,
        billAmount: parseFloat(billAmount),
        remainingAmount: parseFloat(billAmount),
        vendor: purchaseOrder.vendor, // 🔹 Set vendor directly from PO
        ...rest,
    };
    const bill = await Bill.create(billData);

    // 4. Delegate PO total/status update
    await purchaseOrderService.updatePurchaseOrderStatus(poId);

    return bill;
};

export const queryBills = async (
    filter: Record<string, any>,
    options: QueryOptions
): Promise<any> => {
    let { minAmount, maxAmount, vendorId, status, ...newFilter } = filter;

    if (typeof status === "string" && status.includes(",")) {
        status = status.split(",");
    }

    if (minAmount && maxAmount) {
        newFilter.billAmount = { $gte: minAmount, $lte: maxAmount };
    } else if (minAmount) {
        newFilter.billAmount = { $gte: minAmount };
    } else if (maxAmount) {
        newFilter.billAmount = { $lte: maxAmount };
    }

    if (Array.isArray(status)) {
        newFilter.status = { $in: status };
    } else if (status) {
        newFilter.status = status;
    }


    return Bill.paginate(newFilter, {
        ...options,
        populate: [
            'attachments',
            { path: 'category', model: 'ExpenseCategory' },
            {
                path: 'purchaseOrder',
                populate: { path: 'vendor', model: 'Vendor' }
            }
        ]
    });
};

export const getBillById = async (
    billId: string
): Promise<BillDocument | null> => {
    return Bill.findById(billId)
        .populate({
            path: 'purchaseOrder',
            populate: { path: 'vendor', model: 'Vendor' },
        })
        .populate('attachments')
        .populate({path: 'category', model: 'ExpenseCategory'});
};

export const updateBill = async (
    billId: string,
    updateBody: any,
    req: Request
): Promise<BillDocument> => {
    const bill = await Bill.findById(billId);
    if (!bill) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
    }

    // Prevent changing the PO association
    if (updateBody.purchaseOrder && updateBody.purchaseOrder !== bill.purchaseOrder.toString()) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Cannot change the associated purchase order'
        );
    }

    // Apply any billAmount change and recalc remainingAmount
    if (updateBody.billAmount !== undefined) {
        const newAmt = parseFloat(updateBody.billAmount);
        bill.remainingAmount = newAmt; // or recalc via payments if you prefer
        bill.billAmount = newAmt;
    }

    // Merge other allowed updates
    Object.assign(bill, updateBody);
    await bill.save();

    // Delegate PO total/status update
    await purchaseOrderService.updatePurchaseOrderStatus(bill.purchaseOrder.toString());

    return bill;
};

export const deleteBill = async (billId: string): Promise<BillDocument> => {
    const bill = await Bill.findByIdAndDelete(billId);
    if (!bill) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
    }

    // Re-run PO status in case removing this bill changes state
    await purchaseOrderService.updatePurchaseOrderStatus(bill.purchaseOrder.toString());

    return bill;
};

export const calculateRemainingAmount = async (billId: string): Promise<{ billId: string; remainingAmount: number; status: 'paid' | 'unpaid' }> => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');

    return {
        billId: bill.id.toString(),
        remainingAmount: bill.remainingAmount,
        status: bill.remainingAmount <= 0 ? 'paid' : 'unpaid',
    };
};

export const appendPaymentToBill = async (
    billId: string,
    paymentId: string,
    newRemainingAmount: number,
    status: 'paid' | 'unpaid'
): Promise<void> => {
    const bill = await Bill.findById(billId);
    if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');

    bill.remainingAmount = newRemainingAmount;
    bill.status = status;
    bill.payments = bill.payments || [];
    bill.payments.push(new mongoose.Types.ObjectId(paymentId));
    await bill.save();

    await purchaseOrderService.updatePurchaseOrderStatus(bill.purchaseOrder.toString());
};

