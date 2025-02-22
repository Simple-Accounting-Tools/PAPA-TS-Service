import express from "express";
import {getVendors, createVendor, updateVendor, getVendorById, deleteVendor} from "../controllers/vendorController";
import multer from "multer";

const router = express.Router();
const upload = multer();

// Define routes and attach controller functions
router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", upload.none(), createVendor);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor); // Add this line

export default router;
