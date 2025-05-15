import { Router } from 'express';
import { uploadAttachments, removeAttachments } from '../controllers/attachment.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Upload multiple files under field name 'files'
router.post('/', upload.array('files'), uploadAttachments);

// Delete attachments by IDs in JSON body
router.delete('/', removeAttachments);

export default router;