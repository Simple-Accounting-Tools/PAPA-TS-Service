import { Router } from 'express';
import {
    createBill,
    getBills,
    getBillById,
    updateBill,
    deleteBill,
} from '../controllers/bill.controller';

const router = Router();

router.route('/')
    .post(createBill)
    .get(getBills);

router.route('/:billId')
    .get(getBillById)
    .put(updateBill)
    .delete(deleteBill);

export default router;
