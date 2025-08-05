// Super Simple BMECom Login - Guaranteed to Work

console.log('🔧 Loading Super Simple BMECom Login...');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, setting up login...');
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginContent = document.getElementById('loginContent');
    const registerContent = document.getElementById('registerContent');
    
    // Check if already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        console.log('✅ User already logged in, redirecting...');
        window.location.href = 'articles.html';
        return;
    }
    
    // Setup tab switching
    if (loginTab && registerTab && loginContent && registerContent) {
        loginTab.onclick = function() {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginContent.style.display = 'block';
            registerContent.style.display = 'none';
        };
        
        registerTab.onclick = function() {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerContent.style.display = 'block';
            loginContent.style.display = 'none';
        };
    }
    
    // Setup login form
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            handleLogin();
        };
    }
    
    // Setup register form
    if (registerForm) {
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            handleRegister();
        };
    }
    
    console.log('✅ Login setup complete!');
});

// Handle login
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email
        }));
        
        showMessage('Login successful! Redirecting...', 'success');
        
        setTimeout(function() {
            window.location.href = 'articles.html';
        }, 1000);
    } else {
        showMessage('Invalid email or password', 'error');
    }
}

// Handle register
function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        showMessage('Email already registered. Please login instead.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        password: password
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login
    localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    }));
    
    showMessage('Registration successful! Redirecting...', 'success');
    
    setTimeout(function() {
        window.location.href = 'articles.html';
    }, 1000);
}

// Show message
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = '<div class="' + type + '-message">' + message + '</div>';
        setTimeout(function() {
            messageContainer.innerHTML = '';
        }, 5000);
    }
}

console.log('✅ Super Simple BMECom Login loaded successfully!'); 