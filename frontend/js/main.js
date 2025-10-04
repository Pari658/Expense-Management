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

// --- MOCK DATA FOR TESTING ROLES (Remove when backend is integrated) ---
// Change the role here to test the different dashboard views!
const MOCK_USER_DATA = {
    isLoggedIn: true,
    name: "Alex Johnson",
    role: "Admin", // TEST ROLES: "Admin", "Manager", "Employee"
    userId: "A1001",
    companyCurrency: "USD"
};

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
 * Renders the correct view based on the user's role.
 * @param {string} role The user's role ("admin", "manager", or "employee").
 */
function renderDashboardView(role) {
    hideAllViews();
    
    // Set user info in the header
    userNameElement.textContent = MOCK_USER_DATA.name;
    userRoleElement.textContent = role;
    userRoleElement.setAttribute('data-role', role.toLowerCase());

    // Show the specific view based on role
    switch (role.toLowerCase()) {
        case 'admin':
            adminView.classList.remove('hidden');
            break;
        case 'manager':
            managerView.classList.remove('hidden');
            // Mock data for manager-specific content
            // renderManagerApprovals(); // To be implemented later
            break;
        case 'employee':
            employeeView.classList.remove('hidden');
            // Mock data for employee-specific content
            // renderExpenseSubmissionForm(); // To be implemented later
            break;
        default:
            // Handle unknown role or error state
            console.error("Unknown user role:", role);
            break;
    }
}

/**
 * Initializes the dashboard page, checks authentication, and renders the view.
 */
function initDashboard() {
    // 1. Check for Authentication (Mocked for now)
    if (!MOCK_USER_DATA.isLoggedIn) {
        // In a real app, this would check for a token in localStorage
        window.location.href = 'index.html';
        return;
    }

    // 2. Render the Dashboard
    renderDashboardView(MOCK_USER_DATA.role);
}

// -------------------------------------------------------------------
// --- INDEX.HTML (Login/Signup) Logic ---
// -------------------------------------------------------------------

/**
 * Shows the Login form and hides the Signup form.
 */
function showLoginForm() {
    loginContainer?.classList.remove('hidden');
    signupContainer?.classList.add('hidden');
}

/**
 * Shows the Signup form and hides the Login form.
 */
function showSignupForm() {
    signupContainer?.classList.remove('hidden');
    loginContainer?.classList.add('hidden');
    populateCountriesDropdown(); // to call the country api and populate the country list
}

// Attaching Event Listeners to Toggles
showSignupLink?.addEventListener('click', (e) => {
    e.preventDefault(); // to stop the <a> tag from changing the URL
    showSignupForm();
});

showLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// --- Login Form Submission Handler ---
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    // In a real app: call loginUser() from api.js, store token/role, and redirect to dashboard.html
    console.log('Login form submitted! Redirecting to dashboard...');
    window.location.href = 'dashboard.html'; 
});

// --- Signup Form Submission Handler (Including Password Check) ---
document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Clear previous error messages
    signupErrorElement?.classList.add('hidden');
    signupErrorElement.textContent = ''; 

    // Get form values
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Password Confirmation Check
    if (password !== confirmPassword) {
        // Display error in the dedicated element
        signupErrorElement.textContent = "Error: Passwords do not match!";
        signupErrorElement.classList.remove('hidden');
        return; // Stop form submission
    }
    
    // In a real app: call signupAdmin() from api.js, store token/role, and redirect.
    console.log('Signup form passed validation and is submitting to API! Redirecting...');
    window.location.href = 'dashboard.html'; 
});

// --- Logout Handler ---
logoutButton?.addEventListener('click', () => {
    // In a real app: Clear token from localStorage
    console.log("User logged out.");
    window.location.href = 'index.html';
});


// -------------------------------------------------------------------
// --- INITIALIZATION ---
// -------------------------------------------------------------------

// Check which page we are on and run the corresponding initialization function
if (document.querySelector('.auth-container')) {
    // We are on index.html, no special initialization needed.
} else if (document.querySelector('.dashboard-main')) {
    // We are on dashboard.html
    initDashboard();
}
