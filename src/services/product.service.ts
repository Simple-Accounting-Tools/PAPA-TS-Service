import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import {Product, ProductDocument} from '../models/product.model';
import { Client } from '../models/client.model';
import { Vendor } from '../models/vendor.model';
import {
    CreateProductInput,
    UpdateProductInput,
    QueryProductsFilter,
} from '../types/product';
import { QueryOptions } from '../types/common';

export const createProduct = async (
    body: CreateProductInput
): Promise<ProductDocument> => {
    const client = await Client.findById(body.clientId);
    if (!client) throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');

    const vendor = await Vendor.findById(body.vendorId);
    if (!vendor) throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');

    return Product.create({
        name: body.name,
        description: body.description,
        vendorId: body.vendorId,
        clientId: body.clientId,
    });
};

export const queryProducts = async (
    filter: QueryProductsFilter,
    options: QueryOptions
): Promise<any> => {
    // Destructure name out so that if it's undefined we don't include it
    const { name, clientId, vendorId } = filter;
    const newFilter: Record<string, any> = {};

    if (name) {
        newFilter.name = { $regex: new RegExp(name, 'i') };
    }
    if (clientId) {
        newFilter.clientId = clientId;
    }
    if (vendorId) {
        newFilter.vendorId = vendorId;
    }

    return Product.paginate(newFilter, options);
};

export const getProductById = async (
    productId: string
): Promise<ProductDocument | null> => {
    return Product.findById(productId);
};

export const updateProduct = async (
    productId: string,
    updateBody: UpdateProductInput
): Promise<ProductDocument> => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    Object.assign(product, updateBody);
    await product.save();
    return product;
};

export const deleteProduct = async (
    productId: string
): Promise<ProductDocument> => {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    return product;
};