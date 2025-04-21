import mongoose, { Document, Schema, Model } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';
import { VendorAttributes } from '../types/vendor';

// Mongoose document interface
export interface VendorDocument extends VendorAttributes, Document {}

// Mongoose model with paginate
interface VendorModel extends Model<VendorDocument> {
    paginate(filter: any, options: any): Promise<any>;
}

const vendorSchema = new Schema<VendorDocument, VendorModel>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        phoneNumber: { type: String },
        netTerms: { type: String },
        notes: { type: String },
        attachments: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }],
        deletedFiles: [{ type: String }],
        street1: { type: String, required: true },
        street2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    },
    { timestamps: true }
);

vendorSchema.plugin(toJSON);
vendorSchema.plugin(paginate);

export const Vendor = mongoose.model<VendorDocument, VendorModel>(
    'Vendor',
    vendorSchema
);
