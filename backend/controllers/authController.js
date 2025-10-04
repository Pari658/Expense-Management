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
    const { name, email, password, companyName, role } = req.body;

    if (!name || !email || !password || !companyName) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const userCount = await User.countDocuments({});
        let userRole = role;
        if (userCount === 0) {
            userRole = 'Admin'; // First user is always Admin
        } else if (!userRole) {
            userRole = 'Employee'; // Default to Employee if not specified
        }

        let company;
        if (userCount === 0) {
            // Create company for first user
            company = await Company.create({
                name: companyName,
                defaultCurrency: 'USD',
            });
        } else {
            // Find existing company by name
            company = await Company.findOne({ name: companyName });
            if (!company) {
                return res.status(404).json({ message: 'Company not found. Please contact admin.' });
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            company: company._id,
        });

        company.users.push(user._id);
        await company.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
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
