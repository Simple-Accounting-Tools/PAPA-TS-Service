import { Router } from 'express';
import {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    deletePurchaseOrder,
} from '../controllers/purchaseOrder.controller';

const router = Router();

router.route('/')
    .post(createPurchaseOrder)
    .get(getPurchaseOrders);

router.route('/:purchaseOrderId')
    .get(getPurchaseOrderById)
    .put(updatePurchaseOrder)
    .delete(deletePurchaseOrder);

export default router;