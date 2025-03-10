import express from "express";
import multer from "multer";
import { pdfExtract } from "../controllers/filereaderController";

const router = express.Router();
const upload = multer();

router.post("/extract", upload.single("file"), pdfExtract);

export default router;