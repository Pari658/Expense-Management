const Expense = require('../models/Expense');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
    const { description, amount } = req.body;
    try {
        const expense = new Expense({
            description,
            amount,
            currency: req.user.company.defaultCurrency, // Use company's default currency
            submittedBy: req.user._id,
            company: req.user.company,
            approvedBy: req.user.manager, // Assign to user's manager for approval
        });

        const createdExpense = await expense.save();
        res.status(201).json(createdExpense);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ submittedBy: req.user._id });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get expenses needing approval by the logged-in manager
// @route   GET /api/expenses/approvals
// @access  Private/Manager
const getExpensesForApproval = async (req, res) => {
    try {
        if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized for this action' });
        }
        const expenses = await Expense.find({ approvedBy: req.user._id, status: 'Pending' }).populate('submittedBy', 'name email');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Approve or reject an expense
// @route   PUT /api/expenses/:id/approve
// @access  Private/Manager
const updateExpenseStatus = async (req, res) => {
    const { status } = req.body; // 'Approved' or 'Rejected'

    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check if the logged-in user is the designated approver
        if (expense.approvedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this expense' });
        }

        expense.status = status;
        const updatedExpense = await expense.save();
        res.json(updatedExpense);

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

module.exports = { createExpense, getMyExpenses, getExpensesForApproval, updateExpenseStatus };
