import axios from 'axios';
import FormData from 'form-data';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { FileExtractResult } from '../types/filereader';

/**
 * Sends a PDF buffer to the external FileReader service and returns the parsed result.
 */
export const extractPdf = async (
    fileBuffer: Buffer,
    filename: string
): Promise<FileExtractResult> => {
    const url = process.env.FILEREADER_URL;
    if (!url) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'FileReader service URL not configured'
        );
    }

    const form = new FormData();
    form.append('file', fileBuffer, {
        filename,
        contentType: 'application/pdf',
    });

    try {
        const response = await axios.post(
            `${url}/extract`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                },
            }
        );
        return response.data as FileExtractResult;
    } catch (err: any) {
        const message = err.response?.data || err.message;
        throw new ApiError(
            httpStatus.BAD_GATEWAY,
            `Error extracting PDF: ${message}`
        );
    }
};