// BMECom Login and Signup JavaScript

// DOM elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const messageContainer = document.getElementById('messageContainer');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

// State management
let isLoginMode = true;

// Toggle between login and signup modes
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        // Switch to login mode
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        authTitle.textContent = 'Login';
        authSubtitle.textContent = 'Welcome back to BMECom';
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Sign up</a>';
        loginBtn.querySelector('.btn-text').textContent = 'Login';
    } else {
        // Switch to signup mode
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        authTitle.textContent = 'Sign Up';
        authSubtitle.textContent = 'Join the BMECom community';
        toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleLink">Login</a>';
        signupBtn.querySelector('.btn-text').textContent = 'Create Account';
    }
    
    // Clear any existing messages
    clearMessage();
    
    // Re-attach event listener to the new toggle link
    document.getElementById('toggleLink').addEventListener('click', function(e) {
        e.preventDefault();
        toggleAuthMode();
    });
}

// Show message
function showMessage(message, type = 'success') {
    messageContainer.innerHTML = `<div class="message ${type}-message">${message}</div>`;
    setTimeout(() => {
        clearMessage();
    }, 5000);
}

// Clear message
function clearMessage() {
    messageContainer.innerHTML = '';
}

// Show loading state
function showLoading(button) {
    const btnText = button.querySelector('.btn-text');
    button.disabled = true;
    btnText.innerHTML = '<span class="loading"></span>Processing...';
}

// Hide loading state
function hideLoading(button, originalText) {
    const btnText = button.querySelector('.btn-text');
    button.disabled = false;
    btnText.textContent = originalText;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return null;
}

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Check if user exists
function userExists(email) {
    const users = getUsers();
    return users.find(user => user.email === email);
}

// Create new user
function createUser(userData) {
    const users = getUsers();
    
    // Check if user already exists
    if (userExists(userData.email)) {
        throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'User',
        createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    saveUsers(users);
    
    return newUser;
}

// Authenticate user
function authenticateUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('Invalid email or password');
    }
    
    return user;
}

// Login form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading
    showLoading(loginBtn);
    
    try {
        // Authenticate user
        const user = authenticateUser(email, password);
        
        // Store current user (without password)
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        // Show success message
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to articles page after a short delay
        setTimeout(() => {
            window.location.href = 'articles.html';
        }, 1500);
        
    } catch (error) {
        showMessage(error.message, 'error');
        hideLoading(loginBtn, 'Login');
    }
});

// Signup form submission
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
        showMessage(passwordError, 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Show loading
    showLoading(signupBtn);
    
    try {
        // Create new user
        const newUser = createUser({ name, email, password });
        
        // Store current user (without password)
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        // Show success message
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // Redirect to articles page after a short delay
        setTimeout(() => {
            window.location.href = 'articles.html';
        }, 1500);
        
    } catch (error) {
        showMessage(error.message, 'error');
        hideLoading(signupBtn, 'Create Account');
    }
});

// Toggle link event listener
toggleLink.addEventListener('click', function(e) {
    e.preventDefault();
    toggleAuthMode();
});

// Check if user is already logged in
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // User is already logged in, redirect to articles
        window.location.href = 'articles.html';
    }
}

// Mobile navigation
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    // Clear any existing messages
    clearMessage();
    
    // Focus on first input
    const firstInput = document.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (!header) return;
    
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}); 