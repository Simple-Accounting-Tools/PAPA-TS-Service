import mongoose, { Document, Schema, Types, Model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface BillAttributes {
    purchaseOrder: Types.ObjectId;
    clientId: Types.ObjectId;
    billAmount: number;
    remainingAmount: number;
    dueDate: Date;
    status?: 'unpaid' | 'paid' | 'partially-paid'; // Adjust as needed
    category?: Types.ObjectId;
    attachments?: Types.ObjectId[];
    payments?: Types.ObjectId[];
}

export interface BillDocument extends BillAttributes, Document {
    createdAt: Date;
    updatedAt: Date;
}

const billSchema = new Schema<BillDocument>(
    {
        purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        billAmount: { type: Number, required: true },
        remainingAmount: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        status: { type: String, enum: ['unpaid', 'paid', 'partially-paid'], default: 'unpaid' },
        category: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory' },
        attachments: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }],
        payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    },
    { timestamps: true }
);

billSchema.plugin(mongoosePaginate);

interface BillModel<T extends Document> extends Model<T> {
    paginate: (filter: any, options: any) => Promise<any>; // refine if needed
}

export const Bill = mongoose.model<BillDocument, BillModel<BillDocument>>('Bill', billSchema);
