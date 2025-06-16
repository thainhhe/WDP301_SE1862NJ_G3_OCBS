import express from 'express';
const router = express.Router();
import { getUsers } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Tất cả các route trong file này đều cần protect và quyền admin
router.route('/').get(protect, admin, getUsers);

export default router;
