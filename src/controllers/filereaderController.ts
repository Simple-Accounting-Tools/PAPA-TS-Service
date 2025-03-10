import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

export const pdfExtract = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const form = new FormData();
        form.append('file', file.buffer, {
            filename: file.originalname,
            contentType: 'application/pdf'
        });

        const response = await axios.post(
            `${process.env.FILEREADER_URL}/extract`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive'
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};