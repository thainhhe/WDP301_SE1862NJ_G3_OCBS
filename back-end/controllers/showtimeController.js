import Showtime from '../models/showtimeModel.js';
import  mongoose from 'mongoose';
import  movieModel from '../models/movieModel.js';
import  branchModel from '../models/branchModel.js';
import  theaterModel from '../models/branchModel.js';
import {populate} from "dotenv";

// @desc    Get all showtimes
export const getAllShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find()
            .populate('movie', 'title duration')
            .populate('branch', 'name');

        res.json(showtimes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single showtime
export const getShowtimeById = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate('movie', 'title duration')
            .populate('branch', 'name');

        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.json(showtime);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new showtime
export const createShowtime = async (req, res) => {
    try {
        const {
            movie,
            branch,
            theater,
            startTime,
            endTime,
            price,
            isLastShow,
            isFirstShow,
            seatsAvailable
        } = req.body;

        const showtime = new Showtime({
            movie,
            branch,
            theater,
            startTime,
            endTime,
            price,
            isLastShow,
            isFirstShow,
            seatsAvailable,
        });

        const created = await showtime.save();
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update an existing showtime
export const updateShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        Object.assign(showtime, req.body);
        const updated = await showtime.save();
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete a showtime
export const deleteShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        await showtime.remove();
        res.json({ message: 'Showtime removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
