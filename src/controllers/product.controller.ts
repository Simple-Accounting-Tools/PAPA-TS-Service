import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { productService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { Request, Response } from 'express';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(httpStatus.CREATED).send({ product });
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ['name', 'clientId', 'vendorId']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await productService.queryProducts(filter, options);
    res.send(result);
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await productService.getProductById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    res.send({ product });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await productService.updateProduct(productId, req.body);
    res.send({ product });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    await productService.deleteProduct(productId);
    res.status(httpStatus.OK).send();
});