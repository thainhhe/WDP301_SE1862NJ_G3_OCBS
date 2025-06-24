import express from 'express';
import {
    createTheater,
    getAllTheaters,
    getTheaterById,
    updateTheater,
    deleteTheater
} from '../controllers/theaterController.js';

const router = express.Router();

router.post('/', createTheater);
router.get('/', getAllTheaters);
router.get('/:id', getTheaterById);
router.put('/:id', updateTheater);
router.delete('/:id', deleteTheater);

export default router;
