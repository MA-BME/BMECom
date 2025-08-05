// Simplified BMECom Login JavaScript - Working Version

console.log('🔧 Loading Simplified BMECom Login...');

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginContent = document.getElementById('loginContent');
const registerContent = document.getElementById('registerContent');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing BMECom Login...');
    
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'articles.html';
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ BMECom Login initialized successfully!');
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    if (loginTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => switchTab('register'));
    }
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Mobile navigation
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Switch between login and register tabs
function switchTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginContent.style.display = 'block';
        registerContent.style.display = 'none';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerContent.style.display = 'block';
        loginContent.style.display = 'none';
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        // Get stored users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login successful
            const currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'User',
                createdAt: user.createdAt
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to articles page
            setTimeout(() => {
                window.location.href = 'articles.html';
            }, 1000);
            
        } else {
            showMessage('Invalid email or password', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        // Get stored users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            showMessage('Email already registered. Please login instead.', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'user-' + Date.now(),
            name: name,
            email: email,
            password: password,
            role: 'User',
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login the new user
        const currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showMessage('Registration successful! Redirecting...', 'success');
        
        // Redirect to articles page
        setTimeout(() => {
            window.location.href = 'articles.html';
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
}

// Show message
function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(() => messageContainer.innerHTML = '', 5000);
}

console.log('✅ Simplified BMECom Login loaded successfully!'); 