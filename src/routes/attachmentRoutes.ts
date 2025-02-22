import express from "express";
import {
    uploadAttachment,
    getAttachment,
    downloadAttachment,
    deleteAttachment,
    uploadMiddleware
} from "../controllers/attachmentController";

const router = express.Router();

// Upload a new attachment
router.post("/upload/:clientId", uploadMiddleware, uploadAttachment);

// Get metadata of an attachment
router.get("/:id", getAttachment);

// Download an attachment
router.get("/download/:id", downloadAttachment);

// Delete an attachment
router.delete("/:id", deleteAttachment);

export default router;
