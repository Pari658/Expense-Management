// --- INDEX.HTML DOM References ---
const loginContainer = document.getElementById('login-form-container');
const signupContainer = document.getElementById('signup-form-container');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const signupErrorElement = document.getElementById('signup-error');

// --- DASHBOARD.HTML DOM References ---
const loadingState = document.getElementById('loading-state');
const employeeView = document.getElementById('employee-view');
const managerView = document.getElementById('manager-view');
const adminView = document.getElementById('admin-view');
const userNameElement = document.getElementById('user-display-name');
const userRoleElement = document.getElementById('user-display-role');
const logoutButton = document.getElementById('logout-button');
const employeeExpenseTableBody = document.querySelector('#employee-expense-table tbody');
const managerApprovalTableBody = document.querySelector('#manager-approval-table tbody');
const adminAllExpensesTableBody = document.querySelector('#admin-all-expenses-table tbody'); 


// --- MOCK DATA FOR TESTING ROLES (Used if token isn't found for dashboard) ---
// **NOTE:** Only used as fallback. Real data comes from localStorage/API.
const MOCK_USER_DATA = {
    isLoggedIn: false, // Set to false to force token check
    name: "Susan Lee (Admin)",
    role: "Admin", 
    userId: "A0001",
    companyCurrency: "USD"
};

// --- MOCK EXPENSE DATA (Used for rendering logic tests) ---
const MOCK_EMPLOYEE_EXPENSES = [
    { id: 1, date: '2025-10-01', category: 'Travel', amount: 450.50, status: 'approved' },
];
const MOCK_APPROVAL_QUEUE = [
    { id: 101, employee: 'Alex Johnson', date: '2025-10-05', amount: 230.99, localCurrency: 'EUR', currencyConversion: '245.00 USD' },
];
const MOCK_ADMIN_ALL_EXPENSES = [
    { id: 201, employee: 'Ben Taylor', amount: 75.00, status: 'pending', currentApprover: 'Jane Smith' },
];


/**
 * Utility function to hide all role views.
 */
function hideAllViews() {
    loadingState?.classList.add('hidden');
    employeeView?.classList.add('hidden');
    managerView?.classList.add('hidden');
    adminView?.classList.add('hidden');
}

/**
 * Generates the HTML for the expense status badge.
 * @param {string} status The status string ('approved', 'rejected', 'pending').
 */
function getStatusBadge(status) {
    const className = `status-${status.toLowerCase()}`;
    return `<span class="status-badge ${className}">${status}</span>`;
}

// -------------------------------------------------------------------
// --- DASHBOARD RENDERING FUNCTIONS (Phase 2 - Complete) ---
// -------------------------------------------------------------------

function renderEmployeeHistory(expenses) {
    employeeExpenseTableBody.innerHTML = '';
    if (expenses.length === 0) {
        employeeExpenseTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No expense claims submitted yet.</td></tr>';
        return;
    }
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${getStatusBadge(expense.status)}</td>
        `;
        employeeExpenseTableBody.appendChild(row);
    });
}

function renderManagerApprovals(approvals) {
    managerApprovalTableBody.innerHTML = '';
    if (approvals.length === 0) {
        managerApprovalTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No expenses awaiting your approval.</td></tr>';
        return;
    }
    approvals.forEach(expense => {
        const row = document.createElement('tr');
        row.setAttribute('data-expense-id', expense.id); 
        row.innerHTML = `
            <td>${expense.employee}</td>
            <td>${expense.date}</td>
            <td>${expense.currencyConversion} (from ${expense.amount.toFixed(2)} ${expense.localCurrency})</td>
            <td>
                <div class="approval-actions">
                    <button class="btn btn-approve" data-action="approve">Approve</button>
                    <button class="btn btn-reject" data-action="reject">Reject</button>
                    <input type="text" placeholder="Add comment (optional)" class="comment-input">
                </div>
            </td>
        `;
        managerApprovalTableBody.appendChild(row);
    });
    // Placeholder listener for Manager actions (will call API functions)
    document.querySelectorAll('.btn-approve, .btn-reject').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const row = e.target.closest('tr');
            const expenseId = row.getAttribute('data-expense-id');
            const action = e.target.getAttribute('data-action');
            const comment = row.querySelector('.comment-input').value;
            // TODO: Replace with call to api.js: await handleApproval(expenseId, action, comment)
            console.log(`[MOCK] Calling API: ${action.toUpperCase()} expense ${expenseId}...`);
            // Example of removing row after successful API call: row.remove();
        });
    });
}

function renderAdminViews(expenses) {
    adminAllExpensesTableBody.innerHTML = '';
    if (expenses.length === 0) {
        adminAllExpensesTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No expenses recorded for the company.</td></tr>';
        return;
    }
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.employee}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${getStatusBadge(expense.status)} (Current: ${expense.currentApprover})</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="console.log('Admin overriding status for expense ${expense.id}')">Override Status</button>
            </td>
        `;
        adminAllExpensesTableBody.appendChild(row);
    });
    // NOTE: User Management form handler is attached via attachDashboardFormHandlers
}


/**
 * Renders the correct view based on the user's role.
 * @param {object} userData - The actual user data (name, role) returned from API.
 */
function renderDashboardView(userData) {
    hideAllViews();
    
    // Set user info in the header
    userNameElement.textContent = userData.name;
    userRoleElement.textContent = userData.role;
    userRoleElement.setAttribute('data-role', userData.role.toLowerCase());

    const role = userData.role.toLowerCase();

    // Show the specific view based on role and use mock data for now
    switch (role) {
        case 'admin':
            adminView.classList.remove('hidden');
            renderAdminViews(MOCK_ADMIN_ALL_EXPENSES); 
            break;
        case 'manager':
            managerView.classList.remove('hidden');
            renderManagerApprovals(MOCK_APPROVAL_QUEUE); 
            break;
        case 'employee':
            employeeView.classList.remove('hidden');
            renderEmployeeHistory(MOCK_EMPLOYEE_EXPENSES); 
            break;
        default:
            console.error("Unknown user role:", role);
            break;
    }
}

/**
 * Attaches form submission handlers for forms located on the dashboard.
 * (Employee Expense Submission and Admin User Creation)
 */
function attachDashboardFormHandlers() {
    // 1. Employee Expense Submission Form
    document.getElementById('expense-submission-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: Gather form data and call api.js: submitExpense(data)
        console.log('[MOCK] Expense submitted successfully! (Needs API integration)');
    });

    // 2. Admin User Creation Form
    document.getElementById('user-creation-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: Gather form data (Name, Email, Role) and call api.js: createUser(data)
        console.log('[MOCK] Admin submitted new user creation request. (Needs API integration)');
    });
}


// -------------------------------------------------------------------
// --- INDEX.HTML (Login/Signup) Logic - Phase 3 INTEGRATION ---
// -------------------------------------------------------------------

/**
 * Shows the Login form and hides the Signup form.
 */
function showLoginForm() {
    loginContainer?.classList.remove('hidden');
    signupContainer?.classList.add('hidden');
    signupErrorElement?.classList.add('hidden'); // Clear errors when switching
}

/**
 * Shows the Signup form and hides the Login form.
 */
function showSignupForm() {
    signupContainer?.classList.remove('hidden');
    loginContainer?.classList.add('hidden');
    signupErrorElement?.classList.add('hidden'); // Clear errors when switching
    // populateCountriesDropdown is in api.js and must be available globally
    if (typeof populateCountriesDropdown === 'function') {
        populateCountriesDropdown(); 
    }
}

// Attaching Event Listeners to Toggles
showSignupLink?.addEventListener('click', (e) => {
    e.preventDefault(); 
    showSignupForm();
});

showLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// --- Login Form Submission Handler (REAL API INTEGRATION) ---
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupErrorElement?.classList.add('hidden'); // Use same error element for login errors

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // REAL API CALL
        const result = await loginUser({ email, password });
        
        // Success: Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        // Failure: Display error message
        console.error("Login failed:", error);
        signupErrorElement.textContent = error.message || "Login failed. Please check credentials.";
        signupErrorElement.classList.remove('hidden');
    }
});

// --- Signup Form Submission Handler (REAL API INTEGRATION) ---
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Clear previous error messages
    signupErrorElement?.classList.add('hidden');
    signupErrorElement.textContent = ''; 

    // 2. Get form values
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const companyName = document.getElementById('signup-company').value; // Currency code is the option value
    
    // Password Confirmation Check
    if (password !== confirmPassword) {
        signupErrorElement.textContent = "Error: Passwords do not match!";
        signupErrorElement.classList.remove('hidden');
        return; 
    }
    
    // Check if company name was entered
    if (!companyName) {
        signupErrorElement.textContent = "Error: Please enter your company name.";
        signupErrorElement.classList.remove('hidden');
        return; 
    }

    try {
        // REAL API CALL
        const result = await signupAdmin({ name, email, password, companyName });
        
        // Success: Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        // Failure: Display error message
        console.error("Signup failed:", error);
        signupErrorElement.textContent = error.message || "Signup failed. Please try again.";
        signupErrorElement.classList.remove('hidden');
    }
});

// --- Logout Handler ---
logoutButton?.addEventListener('click', () => {
    // Log user out by clearing the token and redirecting
    if (typeof clearAuthToken === 'function') {
        clearAuthToken();
    }
    window.location.href = 'index.html';
});


// -------------------------------------------------------------------
// --- INITIALIZATION ---
// -------------------------------------------------------------------

// Function to get user data from localStorage and initialize dashboard
async function initializeApp() {
    const token = getAuthToken();
    
    if (document.querySelector('.dashboard-main')) {
        // We are on dashboard.html
        if (!token) {
            // No token found, redirect to login
            window.location.href = 'index.html';
            return;
        }

        try {
            // **TODO:** Replace MOCK_USER_DATA with a real API call to get user data from the token
            // const userData = await fetchUserDataFromToken(token); 
            
            // For now, use mock data structure to render the view
            const userData = MOCK_USER_DATA;
            userData.isLoggedIn = true; 

            initDashboard(userData);
        } catch (error) {
            console.error("Dashboard initialization failed:", error);
            // If token is invalid or server is down, redirect to login
            clearAuthToken(); 
            window.location.href = 'index.html';
        }
    } else if (document.querySelector('.auth-container')) {
        // We are on index.html
        // Check if user is already logged in (for immediate redirect)
        if (token) {
            window.location.href = 'dashboard.html';
        }
    }
}

function initDashboard(userData) {
    // 1. Render the Dashboard
    renderDashboardView(userData);
    
    // 2. Attach Form Submission Handlers for Dashboard Forms (Admin/Employee)
    attachDashboardFormHandlers();
}

// Start the application!
// NOTE: We need to ensure api.js is loaded first for functions like getAuthToken.
// We assume both script tags in index.html and dashboard.html load successfully.
initializeApp();

document.addEventListener('DOMContentLoaded', () => {
    showLoginView();
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupView();
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginView();
    });

    // --- Login Form Submission Handler (REAL API INTEGRATION) ---
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupErrorElement?.classList.add('hidden'); // Use same error element for login errors
    
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
    
        try {
            // REAL API CALL
            const result = await loginUser({ email, password });
            
            // Success: Redirect to dashboard
            window.location.href = 'dashboard.html';
    
        } catch (error) {
            // Failure: Display error message
            console.error("Login failed:", error);
            signupErrorElement.textContent = error.message || "Login failed. Please check credentials.";
            signupErrorElement.classList.remove('hidden');
        }
    });
    
    // --- Signup Form Submission Handler (REAL API INTEGRATION) ---
    document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Clear previous error messages
        signupErrorElement?.classList.add('hidden');
        signupErrorElement.textContent = ''; 
    
        // 2. Get form values
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const companyName = document.getElementById('signup-company').value; // Currency code is the option value
        
        // Password Confirmation Check
        if (password !== confirmPassword) {
            signupErrorElement.textContent = "Error: Passwords do not match!";
            signupErrorElement.classList.remove('hidden');
            return; 
        }
        
        // Check if company name was entered
        if (!companyName) {
            signupErrorElement.textContent = "Error: Please enter your company name.";
            signupErrorElement.classList.remove('hidden');
            return; 
        }
    
        try {
            // REAL API CALL
            const result = await signupAdmin({ name, email, password, companyName });
            
            // Success: Redirect to dashboard
            window.location.href = 'dashboard.html';
    
        } catch (error) {
            // Failure: Display error message
            console.error("Signup failed:", error);
            signupErrorElement.textContent = error.message || "Signup failed. Please try again.";
            signupErrorElement.classList.remove('hidden');
        }
    });
});

function showLoginView() {
    loginContainer.style.display = 'block';
    signupContainer.style.display = 'none';
}

function showSignupView() {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
}
