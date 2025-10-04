const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user & company (first user is Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, companyName, currency } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if it's the first user ever, to create the company
        const isFirstUser = (await User.countDocuments({})) === 0;
        if (!isFirstUser) {
            return res.status(400).json({ message: 'Cannot register directly. Admin must create users.' });
        }

        // Create company
        const company = await Company.create({
            name: companyName,
            defaultCurrency: currency,
        });

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: 'Admin', // First user is always Admin
            company: company._id,
        });

        company.users.push(user._id);
        await company.save();

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = { registerUser, loginUser };
