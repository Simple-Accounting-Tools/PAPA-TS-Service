import mongoose from 'mongoose';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { Vendor, VendorDocument } from '../models/vendor.model';
import { Client } from '../models/client.model';
import {
    CreateVendorInput,
    UpdateVendorInput,
    QueryVendorsFilter,
} from '../types/vendor';
import { QueryOptions } from '../types/common';

// Create a new vendor
export const createVendor = async (
    body: CreateVendorInput
): Promise<VendorDocument> => {
    // Ensure client exists
    const client = await Client.findById(body.clientId);
    if (!client) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }

    // Prevent duplicates
    if (
        await Vendor.findOne({ email: body.email, clientId: body.clientId })
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Vendor with this email already exists'
        );
    }

    // Validate attachment IDs
    const attachments = (body.attachments || [])
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

    const vendor = await Vendor.create({
        ...body,
        attachments,
    });
    return vendor;
};

// Query vendors with pagination
export const queryVendors = async (
    filter: QueryVendorsFilter,
    options: QueryOptions
): Promise<any> => {
    return Vendor.paginate(filter, options);
};

// Get a single vendor
export const getVendorById = async (
    id: string
): Promise<VendorDocument> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid vendor ID');
    }
    const vendor = await Vendor.findById(id);
    if (!vendor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
    }
    return vendor;
};

// Update vendor fields
export const updateVendor = async (
    id: string,
    updateBody: UpdateVendorInput
): Promise<VendorDocument> => {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
    }

    // Prevent email collisions
    if (
        updateBody.email &&
        updateBody.email !== vendor.email &&
        (await Vendor.findOne({
            email: updateBody.email,
            clientId: vendor.clientId,
        }))
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Vendor with this email already exists'
        );
    }

    Object.assign(vendor, updateBody);
    await vendor.save();
    return vendor;
};

// Delete a vendor
export const deleteVendor = async (
    id: string
): Promise<void> => {
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
    }
};