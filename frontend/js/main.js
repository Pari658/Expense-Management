// DOM References:
const loginContainer = document.getElementById('login-form-container');
const signupContainer = document.getElementById('signup-form-container');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

// Reference for displaying errors on the Signup form (must exist in index.html)
const signupErrorElement = document.getElementById('signup-error');


/**
 * Shows the Login form and hides the Signup form.
 */
function showLoginForm() {
    loginContainer.classList.remove('hidden');
    signupContainer.classList.add('hidden');
}

/**
 * Shows the Signup form and hides the Login form.
 */
function showSignupForm() {
    signupContainer.classList.remove('hidden');
    loginContainer.classList.add('hidden');
    populateCountriesDropdown(); // to call the country api and populate the country list
}

// Attaching Event Listeners to Toggles
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault(); // to stop the <a> tag from changing the URL
    showSignupForm();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// --- Login Form Submission Handler ---
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Login form submitted!');
    // loginUser(); // will be Calling API function here
});

// --- Signup Form Submission Handler (Including Password Check) ---
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Clear previous error messages
    signupErrorElement.classList.add('hidden');
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
    
    // If validation passes, proceed to backend API call
    // console.log('Signup form passed validation and is submitting to API!');
    // signupAdmin(); // Call API function here
});
