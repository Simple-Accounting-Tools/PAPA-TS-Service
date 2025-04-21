// src/services/purchaseOrder.service.ts

import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { PurchaseOrder, PurchaseOrderDocument } from '../models/purchaseOrder.model';
import { Product } from '../models/product.model';
import { Vendor } from '../models/vendor.model';
import { Client } from '../models/client.model';
import { Bill } from '../models/bill.model';
import { saveAttachments, deleteAttachments } from './attachment.service';
import {
    CreatePurchaseOrderInput,
    UpdatePurchaseOrderInput,
    QueryPurchaseOrdersFilter,
} from '../types/purchaseOrder';
import { QueryOptions } from '../types/common';
import {AttachmentDocument} from "../models/attachment.model";
import {Types} from "mongoose";

export const createPurchaseOrder = async (
    req: Request
): Promise<PurchaseOrderDocument> => {
    const body = req.body as CreatePurchaseOrderInput;

    const client = await Client.findById(body.clientId);
    if (!client) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }

    // Parse items if passed as JSON string
    const itemsArray: CreatePurchaseOrderInput['items'] =
        typeof body.items === 'string'
            ? JSON.parse(body.items)
            : body.items;

    // Validate and compute amounts
    const updatedItems = await Promise.all(
        itemsArray.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new ApiError(
                    httpStatus.NOT_FOUND,
                    `Product with ID ${item.product} not found`
                );
            }
            return { ...item, amount: item.quantity * item.rate };
        })
    );

    const calculatedTotal = updatedItems.reduce((sum, it) => sum + it.amount, 0);
    if (calculatedTotal !== body.totalAmount) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Total amount mismatch'
        );
    }

    const attachments = await saveAttachments(req);
    const shippingCost = parseFloat(req.body.shippingCost as any) || 0;
    const tax = parseFloat(req.body.tax as any) || 0;

    const po = await PurchaseOrder.create({
        vendor: body.vendor,
        items: updatedItems,
        totalAmount: body.totalAmount,
        status: body.status,
        createdBy: body.createdBy,
        notes: body.notes,
        clientId: body.clientId,
        shippingCost,
        tax,
        attachments: attachments.map((a) => a._id),
    });

    return po;
};

export const queryPurchaseOrders = async (
    filter: QueryPurchaseOrdersFilter,
    options: QueryOptions
): Promise<any> => {
    return PurchaseOrder.paginate(filter, {
        ...options,
        populate: ['vendor', 'createdBy', 'attachments', 'items.product'],
    });
};

export const getPurchaseOrderById = async (
    purchaseOrderId: string
): Promise<PurchaseOrderDocument | null> => {
    return PurchaseOrder.findById(purchaseOrderId)
        .populate('vendor', 'name contact')
        .populate('items.product')
        .populate('attachments');
};

export const updatePurchaseOrder = async (
    purchaseOrderId: string,
    req: Request
): Promise<PurchaseOrderDocument> => {
    const updateBody = req.body as UpdatePurchaseOrderInput;

    // Parse items if needed
    if (typeof updateBody.items === 'string') {
        try {
            updateBody.items = JSON.parse(updateBody.items);
        } catch {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid items format');
        }
    }

    // Ensure deletedFiles is always an array
    const deletedFiles = updateBody.deletedFiles ?? [];

    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Purchase Order not found');
    }

    // Remove old attachments
    if (deletedFiles.length > 0) {
        await deleteAttachments(deletedFiles);
        po.attachments = (po.attachments ?? []).filter(
            (id) => !deletedFiles.includes(id.toString())
        );
    }

    // Add new attachments
    const newAttachments: AttachmentDocument[] = await saveAttachments(req);
    po.attachments = [
        ...(po.attachments ?? []),
        ...newAttachments.map((att: AttachmentDocument) => att._id as Types.ObjectId),
    ];

    // Replace items if provided
    if (updateBody.items) {
        po.items = updateBody.items as PurchaseOrderDocument['items'];
    }

    // Merge other fields
    Object.assign(po, updateBody);

    await po.save();
    return po;
};

export const deletePurchaseOrder = async (
    purchaseOrderId: string
): Promise<void> => {
    const po = await PurchaseOrder.findByIdAndDelete(purchaseOrderId);
    if (!po) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Purchase Order not found'
        );
    }
};

export const updatePurchaseOrderStatus = async (
    purchaseOrderId: string
): Promise<PurchaseOrderDocument | null> => {
    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Purchase Order not found'
        );
    }

    const bills = await Bill.find({
        purchaseOrder: purchaseOrderId,
        status: 'paid',
    });
    if (bills.length === 0) return null;

    const totalPaid = bills.reduce((sum, b) => sum + b.billAmount, 0);
    po.totalBilled = totalPaid;
    po.status =
        totalPaid >= po.totalAmount
            ? 'fulfilled'
            : totalPaid > 0
                ? 'partially-received'
                : 'open';

    await po.save();
    return po;
};
