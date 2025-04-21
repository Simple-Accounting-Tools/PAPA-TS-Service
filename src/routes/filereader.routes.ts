import { Router } from 'express';
import multer from 'multer';
import { pdfExtract } from '../controllers/filereader.controller';

const router = Router();
const upload = multer();

// POST /extract - uploads a single PDF file for extraction
router.post('/extract', upload.single('file'), pdfExtract);

export default router;