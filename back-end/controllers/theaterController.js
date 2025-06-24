import Theater from '../models/theaterModel.js';

// Create a new theater
export const createTheater = async (req, res) => {
    try {
        const { name, capacity, seatLayout } = req.body;
        const newTheater = new Theater({ name, capacity, seatLayout });
        const savedTheater = await newTheater.save();
        return res.status(201).json(savedTheater);
    } catch (error) {
        console.error('Error creating theater:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all theaters
export const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find().populate('seatLayout');
        return res.status(200).json(theaters);
    } catch (error) {
        console.error('Error fetching theaters:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get a single theater by ID
export const getTheaterById = async (req, res) => {
    try {
        const { id } = req.params;
        const theater = await Theater.findById(id).populate('seatLayout');
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        return res.status(200).json(theater);
    } catch (error) {
        console.error('Error fetching theater:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update a theater by ID
export const updateTheater = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, capacity, seatLayout } = req.body;
        const updated = await Theater.findByIdAndUpdate(
            id,
            { name, capacity, seatLayout },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        return res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating theater:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete a theater by ID
export const deleteTheater = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Theater.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        return res.status(200).json({ message: 'Theater deleted successfully' });
    } catch (error) {
        console.error('Error deleting theater:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
