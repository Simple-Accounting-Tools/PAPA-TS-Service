import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { Request, Response } from 'express';
import { saveAttachments, deleteAttachments } from '../services/attachment.service';

export const uploadAttachments = catchAsync(
    async (req: Request, res: Response) => {
        const attachments = await saveAttachments(req);
        res.status(httpStatus.CREATED).send({ attachments });
    }
);

export const removeAttachments = catchAsync(
    async (req: Request, res: Response) => {
        const { deletedFiles } = req.body as { deletedFiles: string[] };
        await deleteAttachments(deletedFiles);
        res.status(httpStatus.OK).send();
    }
);
