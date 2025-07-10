import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import multer from "multer";
import "./models"
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import vendorRoutes from "./routes/vendor.routes";
import attachmentRoutes from "./routes/attachment.routes";
import filereaderRoutes from "./routes/filereader.routes";
import billRoutes from "./routes/bill.routes";
import clientRoutes from "./routes/client.routes";
import productRoutes from "./routes/product.routes";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes";
import paymentRoutes from "./routes/payment.routes";
import profileRoutes from "./routes/profile.routes";
import paymentTypeRoutes from "./routes/paymentType.routes";
import { prepareBodyForApi } from "./utils/formDataHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer(); // still create multer instance

app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 👇 Dynamic middleware to choose how to handle body
app.use((req, res, next) => {
    if (req.is('multipart/form-data')) {
        upload.any()(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ message: 'File upload error', error: err.message });
            }

            if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
                const { body } = prepareBodyForApi(req.body);
                req.body = body;
                console.log('Transformed req.body (no files):', req.body);
            } else {
                console.log('Files detected, skipping transformation');
                console.log('req.files:', req.files);
                console.log('req.body (fields):', req.body);
            }
            next();
        });
    } else {
        express.json()(req, res, (err) => {
            if (err) {
                console.error('JSON body parser error:', err);
                return res.status(400).json({ message: 'Invalid JSON', error: err.message });
            }
            next();
        });
    }
});

// Now normal urlencoded handling after JSON
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/attachment", attachmentRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/filereader", filereaderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/product", productRoutes);
app.use("/api/purchaseOrder", purchaseOrderRoutes);
app.use("/api/paymentType", paymentTypeRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
    res.json({ message: "alive" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
