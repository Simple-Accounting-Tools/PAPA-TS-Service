import mongoose, { Document, Schema, Model } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrderAttributes } from '../types/purchaseOrder';

export interface PurchaseOrderDocument
    extends PurchaseOrderAttributes,
        Document {}

interface PurchaseOrderModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

const itemSchema = new Schema<PurchaseOrderAttributes['items'][0]>(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        description: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        rate: { type: Number, required: true, min: 0 },
        amount: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const purchaseOrderSchema = new Schema<PurchaseOrderDocument>(
    {
        poNumber: { type: String, unique: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        items: [itemSchema],
        totalAmount: { type: Number, required: true, min: 0 },
        totalBilled: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ['open', 'partially-received', 'fulfilled', 'closed'],
            default: 'open',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notes: { type: String, trim: true },
        attachments: [
            { type: Schema.Types.ObjectId, ref: 'Attachment' }
        ],
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        shippingCost: { type: Number, default: 0, min: 0 },
        tax: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true, strictQuery: false }
);

purchaseOrderSchema.pre('save', async function (next) {
    if (!this.poNumber) {
        let isUnique = false;
        while (!isUnique) {
            const newPONumber = `PO-${uuidv4().slice(0, 8).toUpperCase()}`;
            const existing = await (this.constructor as Model<PurchaseOrderDocument>)
                .findOne({ poNumber: newPONumber });
            if (!existing) {
                this.poNumber = newPONumber;
                isUnique = true;
            }
        }
    }
    next();
});

purchaseOrderSchema.plugin(toJSON);
purchaseOrderSchema.plugin(paginate);

export const PurchaseOrder = mongoose.model<
    PurchaseOrderDocument,
    PurchaseOrderModel<PurchaseOrderDocument>
>('PurchaseOrder', purchaseOrderSchema);