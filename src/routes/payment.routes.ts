import express from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = express.Router();

router
    .route('/')
    .post(paymentController.createPayment)
    .get(paymentController.getPayments);

router
    .route('/:paymentId')
    .get(paymentController.getPaymentById)
    .patch(paymentController.updatePayment)
    .delete(paymentController.deletePayment);

export default router;