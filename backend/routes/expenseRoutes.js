const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @desc    Test authentication
// @route   GET /api/expenses/test
// @access  Private
router.get('/test', protect, (req, res) => {
    res.status(200).json({
        message: 'Authorization successful!',
        user: req.user
    });
});

module.exports = router;
