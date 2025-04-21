import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db"; // Import the database connection
import vendorRoutes from "./routes/vendor.routes";
import attachmentRoutes from "./routes/attachment.routes";
import filereaderRoutes from "./routes/filereader.routes";
import billRoutes from "./routes/bill.routes";
import clientRoutes from "./routes/client.routes";
import productRoutes from "./routes/product.routes";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes";

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.use("/api/attachment", attachmentRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/filereader", filereaderRoutes);
app.use("/api/product", productRoutes); // Assuming product routes are in attachment.routes
app.use("/api/purchaseOrder", purchaseOrderRoutes);
app.use("/api/vendor", vendorRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Backend service is running!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
