import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

export const pdfExtract = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const file = files[0];
        console.log("File received:", file);
        const form = new FormData();

        form.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype, // safer to use the detected mimetype
        });

        const response = await axios.post(
            `${process.env.FILEREADER_URL}/extract`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                },
                maxBodyLength: Infinity,       // <-- Important for streams
                maxContentLength: Infinity,    // <-- Important for streams
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
