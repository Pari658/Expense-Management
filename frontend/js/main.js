// DOM References:
const loginContainer = document.getElementById('login-form-container');
const signupContainer = document.getElementById('signup-form-container');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');


/**
 * Shows the Login form and hides the Signup form.
 */
function showLoginForm() {
    loginContainer.classList.remove('hidden');
    signupContainer.classList.add('hidden');
    // Update URL or history state if needed, but for simplicity, we skip it here.
}

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// (These functions is defined to talk to our backend API)
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Login form submitted!');
    // loginUser(); // will be Callng API function here
});