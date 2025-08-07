// Global Authentication System for BMECom
// This file handles authentication across all pages

let currentUser = null;

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Initializing global authentication...');
    loadCurrentUser();
    updateNavigation();
});

// Load current user from localStorage
function loadCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('✅ User loaded:', currentUser.name);
        } else {
            console.log('ℹ️ No user logged in');
        }
    } catch (error) {
        console.error('❌ Error loading user:', error);
        currentUser = null;
    }
}

// Update navigation based on authentication status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const moderatorLink = document.getElementById('moderatorLink');
    const userNameElement = document.getElementById('userName');

    if (currentUser) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
        if (moderatorLink && currentUser.role === 'Moderator') {
            moderatorLink.style.display = 'inline';
        }
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
            userNameElement.style.display = 'inline';
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'inline';
        if (logoutLink) logoutLink.style.display = 'none';
        if (moderatorLink) moderatorLink.style.display = 'none';
        if (userNameElement) userNameElement.style.display = 'none';
    }
}

// Logout function
function logout() {
    console.log('🚪 Logging out user:', currentUser?.name);
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavigation();
    
    // Show logout message
    showGlobalMessage('Logged out successfully', 'success');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Show global message
function showGlobalMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `global-message ${type}`;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        messageElement.style.background = '#10b981';
    } else if (type === 'error') {
        messageElement.style.background = '#ef4444';
    } else {
        messageElement.style.background = '#3b82f6';
    }

    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Setup logout event listener
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

console.log('✅ Global authentication system loaded!');
