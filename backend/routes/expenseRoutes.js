const express = require('express');
const router = express.Router();
const {
    createExpense,
    getMyExpenses,
    getExpensesForApproval,
    updateExpenseStatus,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createExpense).get(protect, getMyExpenses);
router.route('/approvals').get(protect, getExpensesForApproval);
router.route('/:id/status').put(protect, updateExpenseStatus);

module.exports = router;
