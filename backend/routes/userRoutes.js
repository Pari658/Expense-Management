const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createUser).get(protect, admin, getUsers);

module.exports = router;
