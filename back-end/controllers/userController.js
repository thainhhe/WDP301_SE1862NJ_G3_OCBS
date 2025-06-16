import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// @desc    Get all users by admin with filtering, searching, pagination, and sorting
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Logic tìm kiếm và lọc (không đổi)
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        }
        : {};
    const roleFilter = req.query.role ? { role: req.query.role } : {};

    // --- LOGIC SẮP XẾP MỚI ---
    const { sortBy, sortOrder } = req.query;
    const sortOptions = {};
    if (sortBy && sortOrder) {
        // Nếu có sortBy và sortOrder, tạo đối tượng sort
        // 'desc' là -1, 'asc' là 1
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        // Mặc định sắp xếp theo ngày tạo mới nhất
        sortOptions.createdAt = -1;
    }
    // --- KẾT THÚC LOGIC SẮP XẾP ---

    const count = await User.countDocuments({ ...keyword, ...roleFilter });

    const users = await User.find({ ...keyword, ...roleFilter })
        .select('-password')
        .sort(sortOptions) // <-- Áp dụng sắp xếp vào query
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        users,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

export { getUsers };
