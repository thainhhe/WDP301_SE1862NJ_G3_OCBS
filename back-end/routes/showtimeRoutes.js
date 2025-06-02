import express from 'express';
import {
    getAllShowtimes,
    getShowtimeById,
    createShowtime,
    updateShowtime,
    deleteShowtime,

} from '../controllers/showtimeController.js';

const router = express.Router();

// CRUD routes
router.route('/')
    .get(getAllShowtimes)
    .post(createShowtime);

router.route('/:id')
    .get(getShowtimeById)
    .put(updateShowtime)
    .delete(deleteShowtime);

export default router;
