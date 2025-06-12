import mongoose from 'mongoose';
import Showtime from '../models/showtimeModel.js';
import Movie from '../models/movieModel.js';
import Branch from '../models/branchModel.js';
import Theater from '../models/theaterModel.js';

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all showtimes
// @route   GET /api/showtimes
// @access  Public
export const getAllShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find()
            .populate('movie', 'title duration')
            .populate('branch', 'name location')
            .populate('theater', 'name capacity');
        res.json(showtimes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single showtime by ID
// @route   GET /api/showtimes/:id
// @access  Public
export const getShowtimeById = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid showtime ID' });
    }

    try {
        const showtime = await Showtime.findById(id)
            .populate('movie', 'title duration')
            .populate('branch', 'name location')
            .populate('theater', 'name capacity');
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.json(showtime);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new showtime
// @route   POST /api/showtimes
// @access  Private/Admin
export const createShowtime = async (req, res) => {
    const {
        movie,
        branch,
        theater,
        startTime,
        endTime,
        price,
        isFirstShow = false,
        isLastShow = false,
        seatsAvailable,
        seatsBooked = 0,
    } = req.body;

    // Kiểm tra bắt buộc
    if (
        ![movie, branch, theater].every(isValidObjectId) ||
        !startTime ||
        !endTime ||
        !price ||
        typeof seatsAvailable !== 'number'
    ) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        // Đảm bảo tồn tại các document liên quan
        const [mv, br, th] = await Promise.all([
            Movie.findById(movie),
            Branch.findById(branch),
            Theater.findById(theater),
        ]);
        if (!mv)   return res.status(404).json({ message: 'Movie not found' });
        if (!br)   return res.status(404).json({ message: 'Branch not found' });
        if (!th)   return res.status(404).json({ message: 'Theater not found' });

        // Kiểm tra logic thời gian
        const start = new Date(startTime);
        const end   = new Date(endTime);
        if (end <= start) {
            return res.status(400).json({ message: 'endTime must be after startTime' });
        }

        // Tạo mới
        const newShowtime = new Showtime({
            movie,
            branch,
            theater,
            startTime: start,
            endTime: end,
            price: {
                standard: price.standard,
                vip:      price.vip || 0,
                couple:   price.couple || 0,
            },
            isFirstShow,
            isLastShow,
            seatsAvailable,
            seatsBooked,
        });

        const created = await newShowtime.save();

        // Populate trước khi trả về
        const populated = await Showtime.findById(created._id)
            .populate('movie', 'title duration')
            .populate('branch', 'name location')
            .populate('theater', 'name capacity');

        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a showtime
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
export const updateShowtime = async (req, res) => {
    const { id } = req.params;
    const {
        movie,
        branch,
        theater,
        startTime,
        endTime,
        price,
        isFirstShow,
        isLastShow,
        seatsAvailable,
        seatsBooked,
    } = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid showtime ID' });
    }

    try {
        const showtime = await Showtime.findById(id);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Validate any incoming ObjectId fields
        if (movie && !isValidObjectId(movie)) {
            return res.status(400).json({ message: 'Invalid movie ID' });
        }
        if (branch && !isValidObjectId(branch)) {
            return res.status(400).json({ message: 'Invalid branch ID' });
        }
        if (theater && !isValidObjectId(theater)) {
            return res.status(400).json({ message: 'Invalid theater ID' });
        }

        // Validate date logic if provided
        let start, end;
        if (startTime) {
            start = new Date(startTime);
            showtime.startTime = start;
        }
        if (endTime) {
            end = new Date(endTime);
            showtime.endTime = end;
        }
        if (startTime && endTime && end <= start) {
            return res.status(400).json({ message: 'endTime must be after startTime' });
        }

        // Assign other fields if present
        if (movie)            showtime.movie = movie;
        if (branch)           showtime.branch = branch;
        if (theater)          showtime.theater = theater;
        if (typeof isFirstShow === 'boolean') showtime.isFirstShow = isFirstShow;
        if (typeof isLastShow  === 'boolean') showtime.isLastShow  = isLastShow;
        if (typeof seatsAvailable === 'number') showtime.seatsAvailable = seatsAvailable;
        if (typeof seatsBooked    === 'number') showtime.seatsBooked    = seatsBooked;

        // Handle price object
        if (price) {
            const { standard, vip, couple } = price;
            if (standard == null || typeof standard !== 'number') {
                return res.status(400).json({ message: 'price.standard is required and must be a number' });
            }
            showtime.price.standard = standard;
            if (vip != null)    showtime.price.vip    = vip;
            if (couple != null) showtime.price.couple = couple;
        }

        // Save and populate
        await showtime.save();

        // Option 1: find lại và populate
        const populated = await Showtime.findById(id)
            .populate('movie', 'title duration')
            .populate('branch', 'name location')
            .populate('theater', 'name capacity');

        return res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Delete a showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
export const deleteShowtime = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid showtime ID' });
    }

    try {
        const deleted = await Showtime.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.json({ message: 'Showtime removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
