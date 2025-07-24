import express from 'express';
import {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
} from '../controllers/branchController.js';


const router = express.Router();

// Public routes
router.get('/', getAllBranches);
router.get('/all', getAllBranches);
router.get('/:id', getBranchById);

// Protected routes (admin only)
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export default router;
