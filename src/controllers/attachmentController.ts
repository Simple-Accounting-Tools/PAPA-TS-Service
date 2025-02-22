import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import AttachmentModel from "../models/attachmentModel";

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: "./uploads/files", // Where files will be stored
    filename: (req, file, cb) => {
        const uniqueFilename = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({ storage });

// Upload File Handler
// ✅ Upload Attachment - Uses `clientId` from URL
export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params; // ✅ Get `clientId` from URL

        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        // ✅ Store `clientId` as `createdBy`
        const newAttachment = new AttachmentModel({
            id: req.file.filename,
            name: req.file.originalname,
            path: `/uploads/files/${req.file.filename}`,
            mimeType: req.file.mimetype,
            createdBy: clientId, // ✅ Store clientId instead of req.user
        });

        await newAttachment.save();

        res.status(201).json({ message: "File uploaded successfully", attachment: newAttachment });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Retrieve Attachment Metadata
export const getAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const attachment = await AttachmentModel.findOne({ id });

        if (!attachment) {
            res.status(404).json({ error: "Attachment not found" });
            return;
        }

        res.status(200).json({ attachment });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Download File
export const downloadAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const attachment = await AttachmentModel.findOne({ id });

        if (!attachment) {
            res.status(404).json({ error: "File not found" });
            return;
        }

        const filePath = path.join(__dirname, "../../", attachment.path);
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: "File not found on server" });
            return;
        }

        res.download(filePath);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Delete Attachment
export const deleteAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const attachment = await AttachmentModel.findOneAndDelete({ id });

        if (!attachment) {
            res.status(404).json({ error: "Attachment not found" });
            return;
        }

        // Remove the file from the server
        const filePath = path.join(__dirname, "../../", attachment.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({ message: "Attachment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const uploadMiddleware = upload.single("attachment"); // Export Multer middleware
