import fs from 'fs';
import path from 'path';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { Request } from 'express';
import { Attachment, AttachmentDocument } from '../models/attachment.model';

export const saveAttachments = async (req: Request): Promise<AttachmentDocument[]> => {
    const files = (req as any).files as Express.Multer.File[];
    if (!files || files.length === 0) return [];

    const baseURL =
        process.env.NODE_ENV === 'production'
            ? process.env.PRO_BASE_URL
            : process.env.LOCAL_BASE_URL;

    const created = await Promise.all(
        files.map(async (file) => {
            const fileType = file.mimetype.split('/')[0];
            let folder = 'others';
            if (fileType === 'image') folder = 'images';
            else if (fileType === 'video') folder = 'videos';
            else if (fileType === 'application') folder = 'files';

            const att = await Attachment.create({
                name: file.originalname,
                path: `/uploads/${folder}/${file.filename}`,
                mimeType: file.mimetype,
                url: `${baseURL}uploads/${folder}/${file.filename}`,
            });

            return att;
        })
    );

    return created;
};

export const deleteAttachments = async (deletedFiles: string[]): Promise<void> => {
    const uploadsDir = path.resolve(__dirname, '../uploads');
    for (const id of deletedFiles) {
        const att = await Attachment.findById(id);
        if (!att) continue;

        const filePath = path.join(uploadsDir, att.path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await att.deleteOne();
    }
};