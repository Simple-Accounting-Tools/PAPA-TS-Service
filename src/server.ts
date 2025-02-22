import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db"; // Import the database connection
import vendorRoutes from "./routes/vendorRoutes";
import attachmentRoutes from "./routes/attachmentRoutes";

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.use("/api/vendor", vendorRoutes);
app.use("/api/attachment", attachmentRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Backend service is running!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
