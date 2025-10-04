const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// Add your auth routes here, for example:
// const { loginUser } = require('../controllers/authController');
// router.post('/login', loginUser);

module.exports = router;
