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
        // User is logged in - show logout option
        if (loginLink) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
        if (logoutLink) logoutLink.style.display = 'none';
        if (moderatorLink && currentUser.role === 'Moderator') {
            moderatorLink.style.display = 'inline';
        }
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
            userNameElement.style.display = 'inline';
        }
    } else {
        // User is not logged in - show login option
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
            loginLink.onclick = null;
        }
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

// Show authentication required message
function showAuthRequiredMessage(action) {
    const messages = {
        'add_article': 'You must be logged in to add articles.',
        'comment': 'You must be logged in to add comments.',
        'like': 'You must be logged in to like articles.',
        'dislike': 'You must be logged in to dislike articles.',
        'delete': 'You must be logged in to delete content.',
        'send_message': 'You must be logged in to send messages.',
        'create_conversation': 'You must be logged in to create conversations.',
        'moderate': 'You must be logged in as a moderator to perform this action.'
    };
    
    const message = messages[action] || 'You must be logged in to perform this action.';
    showGlobalMessage(message, 'error');
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

console.log('✅ Global authentication system loaded!');
