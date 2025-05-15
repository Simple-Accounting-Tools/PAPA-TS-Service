import mongoose, { Document, Model, Schema } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';

export interface IPayment {
    bill: mongoose.Types.ObjectId;
    amount: number;
    discount: number;
    paymentMethod: 'card' | 'bank_transfer' | 'cash' | 'check' | 'ach' | 'wire_transfer';
    status?: 'paid' | 'unpaid';
    paymentDate?: Date;
    notes?: string;
    clientId: mongoose.Types.ObjectId;
    attachments?: mongoose.Types.ObjectId[];
}

export interface PaymentDocument extends IPayment, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

const paymentSchema = new Schema<PaymentDocument>(
    {
        bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
        amount: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        paymentMethod: {
            type: String,
            enum: ['card', 'bank_transfer', 'cash', 'check', 'ach', 'wire_transfer'],
            required: true,
        },
        status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' },
        paymentDate: { type: Date, default: Date.now },
        notes: { type: String, trim: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
    },
    { timestamps: true }
);

paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);

export const Payment: PaymentModel<PaymentDocument> = mongoose.model<PaymentDocument, PaymentModel<PaymentDocument>>(
    'Payment',
    paymentSchema
);