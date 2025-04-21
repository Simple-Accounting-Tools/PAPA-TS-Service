import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { purchaseOrderService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { Request, Response } from 'express';

export const createPurchaseOrder = catchAsync(
    async (req: Request, res: Response) => {
        const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
            req
        );
        res.status(httpStatus.CREATED).send({ purchaseOrder });
    }
);

export const getPurchaseOrders = catchAsync(
    async (req: Request, res: Response) => {
        const filter = pick(req.query, [
            'vendor',
            'status',
            'totalAmount',
            'clientId',
        ]);
        const options = pick(req.query, [
            'sortBy',
            'limit',
            'page',
        ]);
        const result = await purchaseOrderService.queryPurchaseOrders(
            filter,
            options
        );
        res.send(result);
    }
);

export const getPurchaseOrderById = catchAsync(
    async (req: Request, res: Response) => {
        const { purchaseOrderId } = req.params;
        const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(
            purchaseOrderId
        );
        if (!purchaseOrder) throw new ApiError(
            httpStatus.NOT_FOUND,
            'Purchase Order not found'
        );
        res.send({ purchaseOrder });
    }
);

export const updatePurchaseOrder = catchAsync(
    async (req: Request, res: Response) => {
        const { purchaseOrderId } = req.params;
        const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(
            purchaseOrderId,
            req
        );
        res.send({ purchaseOrder });
    }
);

export const deletePurchaseOrder = catchAsync(
    async (req: Request, res: Response) => {
        const { purchaseOrderId } = req.params;
        await purchaseOrderService.deletePurchaseOrder(purchaseOrderId);
        res.status(httpStatus.OK).send();
    }
);