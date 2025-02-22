import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
    {
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            phoneNumber: { type: String },
            netTerms: { type: String },
            notes: { type: String },
            attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }], // References AttachmentModel
            deletedFiles: { type: [String] },
            street1: { type: String, required: true },
            street2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    },
    { timestamps: true }
);

const VendorModel = mongoose.model("Vendor", VendorSchema);
export default VendorModel;
