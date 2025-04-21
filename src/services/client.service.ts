import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import {
    Client,
    ClientDocument,
} from '../models/client.model';
import {
    CreateClientInput,
    UpdateClientInput,
    QueryClientsFilter,
} from '../types/client';
import {QueryOptions} from "../types/common";

export const createClient = async (
    body: CreateClientInput
): Promise<ClientDocument> => {
    const existing = await Client.findOne({ email: body.email });
    if (existing) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Client with this email already exists.'
        );
    }
    return Client.create(body);
};

export const queryClients = async (
    filter: QueryClientsFilter,
    options: QueryOptions
): Promise<any> => {
    return Client.paginate(filter, options);
};

export const getClientById = async (
    clientId: string
): Promise<ClientDocument> => {
    const client = await Client.findById(clientId);
    if (!client) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }
    return client;
};

export const updateClient = async (
    clientId: string,
    updateBody: UpdateClientInput
): Promise<ClientDocument> => {
    const client = await Client.findById(clientId);
    if (!client) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }
    if (
        updateBody.email &&
        updateBody.email !== client.email
    ) {
        const dup = await Client.findOne({ email: updateBody.email });
        if (dup) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Client with this email already exists.'
            );
        }
    }
    Object.assign(client, updateBody);
    await client.save();
    return client;
};

export const deleteClient = async (
    clientId: string
): Promise<void> => {
    const client = await Client.findByIdAndDelete(clientId);
    if (!client) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }
};
