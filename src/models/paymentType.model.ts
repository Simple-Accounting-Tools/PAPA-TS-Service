import mongoose, { Document, Model, Schema } from 'mongoose';
import { paginate } from '../utils/plugins';

export interface IPaymentType {
    name: string;
    /** full card or account number */
    details: string;
    type: 'credit_card' | 'debit_card' | 'bank_account';
    clientId: mongoose.Types.ObjectId;
}

export interface PaymentTypeDocument extends IPaymentType, Document {}

export interface PaymentTypeModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

const paymentTypeSchema = new Schema<PaymentTypeDocument>(
    {
        name: { type: String, required: true, trim: true },
        details: { type: String, required: true },
        type: {
            type: String,
            enum: ['credit_card', 'debit_card', 'bank_account'],
            required: true,
        },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    },
    { timestamps: true }
);

paymentTypeSchema.plugin(paginate);

paymentTypeSchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        const lastFour = ret.details.slice(-4);
        ret.displayName = `${ret.name} ${ret.name.toLowerCase().includes('bank') ? '****' + lastFour : 'ending in ' + lastFour}`;
        ret.endingCardNumber = lastFour;
        delete ret.details;
    },
});

export const PaymentType = mongoose.model<PaymentTypeDocument, PaymentTypeModel<PaymentTypeDocument>>(
    'PaymentType',
    paymentTypeSchema
);
