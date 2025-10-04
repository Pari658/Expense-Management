// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Correct backend port

// --- Local Storage Keys ---
const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';


// -------------------------------------------------------------------
// --- UTILITY FUNCTIONS ---
// -------------------------------------------------------------------

/**
 * Saves the JWT token to local storage.
 * @param {string} token - The JWT token.
 */
function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieves the JWT token from local storage.
 * @returns {string | null} The token or null if not found.
 */
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Clears the JWT token from local storage (for logout).
 */
function clearAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}


/**
 * Core function to handle all authenticated API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {string} method - HTTP method (e.g., 'GET', 'POST').
 * @param {object} [data=null] - JSON payload for POST/PUT requests.
 * @returns {Promise<object>} The JSON response body.
 */
async function fetchData(endpoint, method = 'GET', data = null) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        // Attach the JWT for authenticated routes
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Check for common error status codes (400s, 500s)
        if (!response.ok) {
            const errorData = await response.json();
            // Throw an error with the backend's message
            throw new Error(errorData.message || `API call failed with status ${response.status}`);
        }

        // Return the JSON response body
        return await response.json();

    } catch (error) {
        // If the fetch itself failed (e.g., network error, server down)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Could not connect to the server. Please ensure the backend is running.');
        }
        throw error;
    }
}


// -------------------------------------------------------------------
// --- AUTHENTICATION & INITIAL SETUP ---
// -------------------------------------------------------------------

/**
 * Handles user login.
 */
async function loginUser(credentials) {
    const response = await fetchData('/auth/login', 'POST', credentials);
    
    // Store token and user data on successful login
    setAuthToken(response.token);
    // You should also store user role/name for quick dashboard lookup
    localStorage.setItem(USER_KEY, JSON.stringify({
        name: response.user.name,
        role: response.user.role,
        id: response.user.id 
    }));
    return response;
}

/**
 * Handles the first-time admin signup (creates company + admin).
 */
async function signupAdmin(data) {
    // Use the correct endpoint for registration
    return await fetchData('/auth/register', 'POST', data);
}

// Fetches the country list for the signup form (no auth needed)
const COUNTRY_API_URL = 'https://restcountries.com/v3.1/all?fields=name,currencies';
async function populateCountriesDropdown() {
    const countrySelect = document.getElementById('signup-country');
    if (countrySelect.options.length > 1) { return; }
    
    try {
        const response = await fetch(COUNTRY_API_URL);
        if (!response.ok) { throw new Error('Failed to fetch country data'); }
        const countries = await response.json();
        
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

        countries.forEach(country => {
            const option = document.createElement('option');
            option.textContent = country.name.common;
            const currencyCode = Object.keys(country.currencies)[0];
            option.value = currencyCode; 
            countrySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading countries for signup:", error);
        countrySelect.innerHTML = `<option value="" disabled selected>Error loading countries!</option>`;
    }
}


// -------------------------------------------------------------------
// --- EXPENSE SUBMISSION & VIEWING (Employee/Manager) ---
// -------------------------------------------------------------------

/**
 * Submits a new expense claim.
 */
async function submitExpense(expenseData) {
    // Requires authentication
    return await fetchData('/expenses', 'POST', expenseData);
}

/**
 * Fetches expenses based on the user's role.
 * @param {string} role - 'employee' for history, 'manager' for queue, 'admin' for all.
 */
async function fetchExpenses(role) {
    let endpoint = '';
    switch (role) {
        case 'employee':
            endpoint = '/expenses/mine'; // Get only my submissions
            break;
        case 'manager':
            endpoint = '/expenses/approvals'; // Get items waiting for my approval
            break;
        case 'admin':
            endpoint = '/expenses/all'; // Get all company expenses
            break;
        default:
            throw new Error(`Invalid role for fetching expenses: ${role}`);
    }
    return await fetchData(endpoint, 'GET');
}

/**
 * Handles Manager/Admin approval or rejection of an expense.
 * @param {number} expenseId - ID of the expense to action.
 * @param {string} action - 'approve' or 'reject'.
 * @param {string} comment - Optional comment.
 */
async function handleApproval(expenseId, action, comment) {
    const endpoint = `/expenses/${expenseId}/action`;
    return await fetchData(endpoint, 'PUT', { action, comment });
}


// -------------------------------------------------------------------
// --- ADMIN MANAGEMENT ---
// -------------------------------------------------------------------

/**
 * Admin creates a new Employee or Manager user.
 */
async function createUser(userData) {
    // Requires authentication (and Admin role authorization on the backend)
    return await fetchData('/users', 'POST', userData);
}

// -------------------------------------------------------------------
// --- NEW API FUNCTIONS ---
// -------------------------------------------------------------------

const API_URL = '/api';

async function register(name, email, password, companyName, currency) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName, currency }),
    });
    return response.json();
}

async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
}

async function getMyExpenses(token) {
    const response = await fetch(`${API_URL}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
}

async function createExpense(token, description, amount) {
    const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ description, amount }),
    });
    return response.json();
}
