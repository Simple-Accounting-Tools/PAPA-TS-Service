import { Router } from 'express';
import {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
} from '../controllers/vendor.controller';

const router = Router();

router.route('/')
    .post(createVendor)
    .get(getVendors);

router.route('/:id')
    .get(getVendorById)
    .put(updateVendor)
    .delete(deleteVendor);

export default router;