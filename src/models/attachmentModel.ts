import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true }, // Unique file ID
        name: { type: String, required: true }, // Original file name
        path: { type: String, required: true }, // File path for download
        mimeType: { type: String, required: true }, // File type (PDF, image, etc.)
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who uploaded it
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const AttachmentModel = mongoose.model("Attachment", AttachmentSchema);
export default AttachmentModel;
