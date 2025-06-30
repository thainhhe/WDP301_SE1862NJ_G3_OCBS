import express from "express";
import {
    createVoucher,
    getVouchers,
    getVoucherById,
    updateVoucher,
    deleteVoucher,
} from "../controllers/voucherController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, admin, createVoucher)
    .get(protect, admin, getVouchers);

router.route("/:id")
    .get(protect, admin, getVoucherById)
    .put(protect, admin, updateVoucher)
    .delete(protect, admin, deleteVoucher);

export default router;