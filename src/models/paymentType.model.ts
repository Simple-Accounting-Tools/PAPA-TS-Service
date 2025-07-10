import mongoose, { Document, Model, Schema } from 'mongoose';
import { paginate } from '../utils/plugins';

export interface IPaymentType {
    name: string;
    lastFour: string;
    clientId: mongoose.Types.ObjectId;
}

export interface PaymentTypeDocument extends IPaymentType, Document {}

export interface PaymentTypeModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

const paymentTypeSchema = new Schema<PaymentTypeDocument>(
    {
        name: { type: String, required: true, trim: true },
        lastFour: { type: String, required: true },
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
        ret.displayName = `${ret.name} ${ret.name.toLowerCase().includes('bank') ? '****' + ret.lastFour : 'ending in ' + ret.lastFour}`;
    },
});

export const PaymentType = mongoose.model<PaymentTypeDocument, PaymentTypeModel<PaymentTypeDocument>>(
    'PaymentType',
    paymentTypeSchema
);
