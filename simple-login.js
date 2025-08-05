// Super Simple BMECom Login - Fixed to Match HTML Structure

console.log('🔧 Loading Super Simple BMECom Login...');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, setting up login...');
    
    // Check if already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        console.log('✅ User already logged in, redirecting...');
        window.location.href = 'articles.html';
        return;
    }
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleLink = document.getElementById('toggleLink');
    const toggleText = document.getElementById('toggleText');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    
    console.log('📋 Found elements:', {
        loginForm: !!loginForm,
        signupForm: !!signupForm,
        toggleLink: !!toggleLink
    });
    
    // Setup form switching
    if (toggleLink) {
        toggleLink.onclick = function(e) {
            e.preventDefault();
            toggleForms();
        };
    }
    
    // Setup login form
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            handleLogin();
        };
    }
    
    // Setup signup form
    if (signupForm) {
        signupForm.onsubmit = function(e) {
            e.preventDefault();
            handleSignup();
        };
    }
    
    console.log('✅ Login setup complete!');
});

// Toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleLink = document.getElementById('toggleLink');
    const toggleText = document.getElementById('toggleText');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    
    if (loginForm.style.display === 'none') {
        // Show login form
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        authTitle.textContent = 'Login';
        authSubtitle.textContent = 'Welcome back to BMECom';
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Sign up</a>';
    } else {
        // Show signup form
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        authTitle.textContent = 'Sign Up';
        authSubtitle.textContent = 'Create your BMECom account';
        toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleLink">Login</a>';
    }
    
    // Re-attach click handler
    const newToggleLink = document.getElementById('toggleLink');
    if (newToggleLink) {
        newToggleLink.onclick = function(e) {
            e.preventDefault();
            toggleForms();
        };
    }
}

// Handle login
function handleLogin() {
    console.log('🔐 Handling login...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 Found', users.length, 'users in storage');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('✅ Login successful for user:', user.name);
        
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
        console.log('❌ Login failed - invalid credentials');
        showMessage('Invalid email or password', 'error');
    }
}

// Handle signup
function handleSignup() {
    console.log('📝 Handling signup...');
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    console.log('👤 Name:', name);
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    
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
    
    console.log('✅ Creating new user:', newUser.name);
    
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
    console.log('💬 Showing message:', type, message);
    
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = '<div class="' + type + '-message">' + message + '</div>';
        setTimeout(function() {
            messageContainer.innerHTML = '';
        }, 5000);
    } else {
        console.error('❌ Message container not found!');
        alert(message); // Fallback
    }
}

console.log('✅ Super Simple BMECom Login loaded successfully!'); 