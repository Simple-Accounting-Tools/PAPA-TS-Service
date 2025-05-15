import mongoose, { Document, Schema, Model } from 'mongoose';
import { toJSON, paginate } from '../utils/plugins';
import { AttachmentAttributes } from '../types/attachment';

export interface AttachmentDocument extends AttachmentAttributes, Document {}

interface AttachmentModel<T extends Document> extends Model<T> {
        paginate(filter: any, options: any): Promise<any>;
}

const attachmentSchema = new Schema<AttachmentDocument, AttachmentModel<AttachmentDocument>>(
    {
            name: { type: String, required: true },
            path: { type: String, required: true },
            mimeType: { type: String, required: true },
            url: { type: String, required: true },
    },
    { timestamps: true }
);

attachmentSchema.plugin(toJSON);
attachmentSchema.plugin(paginate);

export const Attachment = mongoose.model<AttachmentDocument, AttachmentModel<AttachmentDocument>>(
    'Attachment',
    attachmentSchema
);
