import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller';

const router = Router();

router.route('/')
    .post(createProduct)
    .get(getProducts);

router.route('/:productId')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

export default router;