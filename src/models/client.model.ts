import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';

export interface ClientAttributes {
    name: string;
    contactName: string;
    phoneNumber: string;
    email: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    user: Types.ObjectId;
}

export interface ClientDocument extends ClientAttributes, Document {}

interface ClientModel<T extends Document> extends Model<T> {
    paginate(filter: any, options: any): Promise<any>;
}

const clientSchema = new Schema<ClientDocument>(
    {
        name: { type: String, required: true, trim: true },
        contactName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        street1: { type: String, required: true },
        street2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

clientSchema.plugin(toJSON);
clientSchema.plugin(paginate);

export const Client = mongoose.model<
    ClientDocument,
    ClientModel<ClientDocument>
>('Client', clientSchema);
