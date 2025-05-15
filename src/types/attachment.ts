import { Types } from 'mongoose';

export interface AttachmentAttributes {
    name: string;
    path: string;
    mimeType: string;
    url: string;
}

export interface CreateAttachmentInput extends AttachmentAttributes {}

export interface DeleteAttachmentsInput {
    deletedFiles: string[];
}