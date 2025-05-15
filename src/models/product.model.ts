import mongoose, { Document, Schema, Model } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';
import { ProductAttributes } from '../types/product';

export interface ProductDocument extends ProductAttributes, Document {}

interface ProductModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

// Note: we pass <ProductDocument, ProductModel<ProductDocument>> to Schema
const productSchema = new Schema<ProductDocument, ProductModel<ProductDocument>>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            minlength: 10,
            maxlength: 300,
            default: 'No description provided',
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
    },
    { timestamps: true }
);

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

export const Product = mongoose.model<ProductDocument, ProductModel<ProductDocument>>(
    'Product',
    productSchema
);
