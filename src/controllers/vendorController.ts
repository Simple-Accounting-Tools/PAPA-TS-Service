import { Request, Response } from "express";
import mongoose from "mongoose";
import VendorModel from "../models/vendorModel";

export const getVendors = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const name = req.query.name as string;
        const clientId = req.query.clientId as string;

        const query: any = {};
        if (name) {
            query.name = { $regex: name, $options: "i" }; // Case-insensitive partial match
        }
        if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
            query.clientId = clientId;
        }

        const totalResults = await VendorModel.countDocuments(query);
        const vendors = await VendorModel.find(query).skip(skip).limit(limit);
        const totalPages = Math.ceil(totalResults / limit);

        res.status(200).json({
            results: vendors,
            page,
            limit,
            totalPages,
            totalResults
        });

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getVendorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid vendor ID format" });
            return;
        }

        const vendor = await VendorModel.findById(id);

        if (!vendor) {
            res.status(404).json({ error: "Vendor not found" });
            return;
        }

        res.status(200).json({ vendor });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const createVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phoneNumber, clientId, attachments, zipCode, state, city, street1, netTerms, notes } = req.body;

        console.log('Full request body:', req.body);
        console.log('Destructured clientId:', clientId);
        console.log('Type of clientId:', typeof clientId);

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            res.status(400).json({ error: "Invalid client ID format" });
            return;
        }

        const vendorExists = await VendorModel.findOne({ email, clientId });
        if (vendorExists) {
            res.status(400).json({ error: "Vendor with this email already exists" });
            return;
        }

        let formattedAttachments: mongoose.Types.ObjectId[] = [];
        if (attachments && Array.isArray(attachments)) {
            formattedAttachments = attachments
                .filter((id: string): boolean => mongoose.Types.ObjectId.isValid(id))
                .map((id: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id));
        }

        const vendor = new VendorModel({
            name,
            email,
            phoneNumber,
            clientId,
            attachments: formattedAttachments,
            zipCode,
            state,
            city,
            street1,
            netTerms,
            notes
        });

        await vendor.save();
        res.status(201).json({ message: "Vendor created successfully", data: vendor });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};


export const updateVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { attachments } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid vendor ID format" });
            return;
        }

        // ✅ Explicitly define the type for attachments
        let formattedAttachments: mongoose.Types.ObjectId[] = [];
        if (attachments && Array.isArray(attachments)) {
            formattedAttachments = attachments
                .filter((id: string): boolean => mongoose.Types.ObjectId.isValid(id))
                .map((id: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id));
        }

        // ✅ Update vendor while keeping existing values
        const updatedVendor = await VendorModel.findByIdAndUpdate(
            id,
            { ...req.body, attachments: formattedAttachments }, // ✅ Keep transformed attachments
            { new: true, runValidators: true }
        );

        if (!updatedVendor) {
            res.status(404).json({ error: "Vendor not found" });
            return;
        }

        res.status(200).json({ message: "Vendor updated successfully", data: updatedVendor });

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid vendor ID format" });
            return;
        }

        const vendor = await VendorModel.findByIdAndDelete(id);

        if (!vendor) {
            res.status(404).json({ error: "Vendor not found" });
            return;
        }

        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

