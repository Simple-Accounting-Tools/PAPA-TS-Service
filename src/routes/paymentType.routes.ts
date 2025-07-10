import { Router } from 'express';
import {
    createPaymentType,
    getPaymentTypes,
    getPaymentTypeById,
    updatePaymentType,
    deletePaymentType,
} from '../controllers/paymentType.controller';

const router = Router();

router.route('/')
    .post(createPaymentType)
    .get(getPaymentTypes);

router.route('/:id')
    .get(getPaymentTypeById)
    .put(updatePaymentType)
    .delete(deletePaymentType);

export default router;
