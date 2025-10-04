const User = require('../models/User');

// @desc    Create a new user (Employee or Manager)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role, managerId } = req.body;

    try {
        // Only Admin can create users
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to create users' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            company: req.user.company, // Associate with admin's company
            manager: managerId, // Assign manager if provided
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all users in the company
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const users = await User.find({ company: req.user.company }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = { createUser, getUsers };
