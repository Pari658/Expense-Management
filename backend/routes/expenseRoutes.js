const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// This is the test route from before
router.get('/test', protect, (req, res) => {
    res.status(200).json({
        message: 'Authorization successful!',
        user: req.user
    });
});

// Add other expense routes here

module.exports = router;
