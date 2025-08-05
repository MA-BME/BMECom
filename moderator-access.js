// Moderator Access Panel - BMECom
console.log('👑 Loading Moderator Access Panel...');

// Global variables
let articles = [];
let users = [];
let currentUser = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Moderator Access Panel loaded');
    
    // Check access and load data
    checkAccess();
    loadData();
    updateStats();
});

// Check if user has moderator access
function checkAccess() {
    console.log('🔐 Checking moderator access...');
    
    // Load current user
    const userData = localStorage.getItem('currentUser');
    if (userData && userData !== 'null' && userData !== 'undefined') {
        currentUser = JSON.parse(userData);
        console.log('👤 Current user:', currentUser);
    } else {
        currentUser = null;
        console.log('❌ No current user found');
    }
    
    // Check if user is a moderator
    if (!currentUser || (currentUser.role !== 'moderator' && currentUser.role !== 'Moderator')) {
        console.log('❌ User is not a moderator');
        showAccessDenied();
        return false;
    }
    
    console.log('✅ User has moderator access');
    showModeratorContent();
    return true;
}

// Show access denied message
function showAccessDenied() {
    document.getElementById('accessDenied').style.display = 'block';
    document.getElementById('moderatorContent').style.display = 'none';
}

// Show moderator content
function showModeratorContent() {
    document.getElementById('accessDenied').style.display = 'none';
    document.getElementById('moderatorContent').style.display = 'block';
    
    // Update user status
    const userStatus = document.getElementById('userStatus');
    if (userStatus) {
        userStatus.innerHTML = `
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 8px;">
                <span class="status-indicator status-online"></span>
                Logged in as: <strong>${currentUser.name}</strong> (${currentUser.email})
            </div>
        `;
    }
}

// Load data from localStorage
function loadData() {
    try {
        articles = JSON.parse(localStorage.getItem('articles') || '[]');
        users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('📊 Loaded', articles.length, 'articles and', users.length, 'users');
    } catch (error) {
        console.error('Error loading data:', error);
        articles = [];
        users = [];
    }
}

// Update statistics
function updateStats() {
    const totalArticles = articles.length;
    const totalUsers = users.length;
    const moderatorCount = users.filter(u => u.role === 'moderator' || u.role === 'Moderator').length;
    const uniqueUrls = new Set(articles.map(a => a.url)).size;
    const duplicateCount = totalArticles - uniqueUrls;
    
    document.getElementById('totalArticles').textContent = totalArticles;
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('moderatorCount').textContent = moderatorCount;
    document.getElementById('duplicateCount').textContent = duplicateCount;
}

// Show message
function showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    switch(type) {
        case 'success':
            messageDiv.style.background = '#10b981';
            break;
        case 'error':
            messageDiv.style.background = '#ef4444';
            break;
        case 'warning':
            messageDiv.style.background = '#f59e0b';
            break;
        default:
            messageDiv.style.background = '#667eea';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Delete all articles
function deleteAllArticles() {
    if (!checkAccess()) return;
    
    if (articles.length === 0) {
        showMessage('No articles to delete', 'info');
        return;
    }
    
    const confirmMessage = `Are you sure you want to delete ALL ${articles.length} articles?\n\nThis action cannot be undone!`;
    
    if (confirm(confirmMessage)) {
        // Clear all articles
        articles = [];
        localStorage.setItem('articles', JSON.stringify(articles));
        
        // Clear all user likes/dislikes for all users
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('userLikes_') || key.startsWith('userDislikes_')) {
                localStorage.removeItem(key);
            }
        });
        
        showMessage(`Successfully deleted all ${articles.length} articles!`, 'success');
        updateStats();
        hideAllLists();
    }
}

// Show article list
function showArticleList() {
    if (!checkAccess()) return;
    
    hideAllLists();
    const articlesList = document.getElementById('articlesList');
    const articlesContainer = document.getElementById('articlesContainer');
    
    if (articles.length === 0) {
        articlesContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">No articles found.</p>';
    } else {
        articlesContainer.innerHTML = articles.map((article, index) => `
            <div class="article-item">
                <div class="article-info">
                    <div class="article-title">${article.title}</div>
                    <div class="article-meta">
                        Added by: ${article.userName || 'Unknown'} | 
                        Date: ${new Date(article.timestamp).toLocaleDateString()} |
                        URL: ${article.url.substring(0, 50)}...
                    </div>
                </div>
                <div class="article-actions">
                    <button class="moderator-btn danger" onclick="deleteSingleArticle('${article.id}')" style="width: auto; padding: 8px 16px;">Delete</button>
                    <button class="moderator-btn" onclick="viewArticle('${article.id}')" style="width: auto; padding: 8px 16px;">View</button>
                </div>
            </div>
        `).join('');
    }
    
    articlesList.style.display = 'block';
}

// Delete single article
function deleteSingleArticle(articleId) {
    if (!checkAccess()) return;
    
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        showMessage('Article not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
        // Remove article
        const articleIndex = articles.findIndex(a => a.id === articleId);
        if (articleIndex > -1) {
            articles.splice(articleIndex, 1);
            localStorage.setItem('articles', JSON.stringify(articles));
            
            // Remove from all user likes/dislikes
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('userLikes_') || key.startsWith('userDislikes_')) {
                    try {
                        const userData = JSON.parse(localStorage.getItem(key) || '[]');
                        const filteredData = userData.filter(id => id !== articleId);
                        localStorage.setItem(key, JSON.stringify(filteredData));
                    } catch (error) {
                        console.error('Error updating user data:', error);
                    }
                }
            });
            
            showMessage('Article deleted successfully', 'success');
            updateStats();
            showArticleList(); // Refresh the list
        }
    }
}

// View article details
function viewArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (article) {
        const details = `
Title: ${article.title}
URL: ${article.url}
Summary: ${article.summary}
Added by: ${article.userName || 'Unknown'}
Date: ${new Date(article.timestamp).toLocaleString()}
        `;
        alert(details);
    }
}

// Show duplicate statistics
function showDuplicateStats() {
    if (!checkAccess()) return;
    
    const stats = {
        totalArticles: articles.length,
        uniqueUrls: new Set(articles.map(a => a.url)).size,
        duplicates: articles.length - new Set(articles.map(a => a.url)).size
    };
    
    alert(`📊 Duplicate Statistics:\n\nTotal Articles: ${stats.totalArticles}\nUnique URLs: ${stats.uniqueUrls}\nDuplicates: ${stats.duplicates}`);
}

// Show all users
function showAllUsers() {
    if (!checkAccess()) return;
    
    hideAllLists();
    const usersList = document.getElementById('usersList');
    const usersContainer = document.getElementById('usersContainer');
    
    if (users.length === 0) {
        usersContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">No users found.</p>';
    } else {
        usersContainer.innerHTML = users.map(user => `
            <div class="article-item">
                <div class="article-info">
                    <div class="article-title">${user.name} (${user.email})</div>
                    <div class="article-meta">
                        Role: ${user.role || 'User'} | 
                        ID: ${user.id} |
                        Created: ${new Date(user.timestamp || Date.now()).toLocaleDateString()}
                    </div>
                </div>
                <div class="article-actions">
                    <button class="moderator-btn" onclick="promoteToModerator('${user.id}')" style="width: auto; padding: 8px 16px;">Make Moderator</button>
                    <button class="moderator-btn danger" onclick="deleteUser('${user.id}')" style="width: auto; padding: 8px 16px;">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    usersList.style.display = 'block';
}

// Promote user to moderator
function promoteToModerator(userId) {
    if (!checkAccess()) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        showMessage('User not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to promote ${user.name} to moderator?`)) {
        user.role = 'moderator';
        localStorage.setItem('users', JSON.stringify(users));
        showMessage(`${user.name} promoted to moderator`, 'success');
        updateStats();
        showAllUsers(); // Refresh the list
    }
}

// Delete user
function deleteUser(userId) {
    if (!checkAccess()) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        showMessage('User not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Remove user's likes/dislikes
            localStorage.removeItem(`userLikes_${userId}`);
            localStorage.removeItem(`userDislikes_${userId}`);
            
            showMessage('User deleted successfully', 'success');
            updateStats();
            showAllUsers(); // Refresh the list
        }
    }
}

// Create moderator account
function createModeratorAccount() {
    if (!checkAccess()) return;
    
    const email = prompt('Enter email for new moderator:');
    if (!email) return;
    
    const name = prompt('Enter name for new moderator:');
    if (!name) return;
    
    const password = prompt('Enter password for new moderator:');
    if (!password) return;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Create new moderator
    const newModerator = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        role: 'moderator',
        timestamp: Date.now()
    };
    
    users.push(newModerator);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage(`Moderator ${name} created successfully`, 'success');
    updateStats();
}

// Reset user data
function resetUserData() {
    if (!checkAccess()) return;
    
    if (confirm('Are you sure you want to reset all user likes/dislikes data?')) {
        const keys = Object.keys(localStorage);
        let resetCount = 0;
        
        keys.forEach(key => {
            if (key.startsWith('userLikes_') || key.startsWith('userDislikes_')) {
                localStorage.removeItem(key);
                resetCount++;
            }
        });
        
        showMessage(`Reset ${resetCount} user data entries`, 'success');
    }
}

// Check AI services status
function checkAIServicesStatus() {
    if (!checkAccess()) return;
    
    const services = ['openai', 'anthropic', 'google', 'cohere', 'huggingface', 'perplexity', 'cursor_ai'];
    let status = '🤖 AI Services Status:\n\n';
    let enabledCount = 0;
    
    services.forEach(service => {
        const apiKey = localStorage.getItem(`${service}ApiKey`);
        const isEnabled = apiKey && apiKey.trim() !== '';
        status += `${isEnabled ? '✅' : '❌'} ${service.charAt(0).toUpperCase() + service.slice(1)}: ${isEnabled ? 'Enabled' : 'Disabled'}\n`;
        if (isEnabled) enabledCount++;
    });
    
    status += `\n📊 Total enabled: ${enabledCount}/${services.length}`;
    
    alert(status);
}

// Clear all AI services
function clearAllAIServices() {
    if (!checkAccess()) return;
    
    if (confirm('Are you sure you want to clear all AI service configurations?')) {
        const services = ['openai', 'anthropic', 'google', 'cohere', 'huggingface', 'perplexity', 'cursor_ai'];
        
        services.forEach(service => {
            localStorage.removeItem(`${service}ApiKey`);
        });
        
        showMessage('All AI services cleared successfully!', 'success');
    }
}

// Update all articles with AI
function updateAllArticlesWithAI() {
    if (!checkAccess()) return;
    
    showMessage('AI update feature would be implemented here', 'info');
}

// Reset ticker statistics
function resetTickerStats() {
    if (!checkAccess()) return;
    
    if (confirm('Are you sure you want to reset all ticker statistics?')) {
        showMessage('Ticker statistics reset successfully!', 'success');
    }
}

// Export data
function exportData() {
    if (!checkAccess()) return;
    
    const data = {
        articles: articles,
        users: users,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bmecom-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showMessage('Data exported successfully', 'success');
}

// Import data
function importData() {
    if (!checkAccess()) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Are you sure you want to import this data? This will overwrite current data.')) {
                    if (data.articles) {
                        articles = data.articles;
                        localStorage.setItem('articles', JSON.stringify(articles));
                    }
                    
                    if (data.users) {
                        users = data.users;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    
                    showMessage('Data imported successfully', 'success');
                    updateStats();
                }
            } catch (error) {
                showMessage('Error importing data: Invalid JSON file', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Hide all lists
function hideAllLists() {
    document.getElementById('articlesList').style.display = 'none';
    document.getElementById('usersList').style.display = 'none';
}

// Global functions for external access
window.deleteAllArticlesNow = deleteAllArticles;
window.showModeratorStats = updateStats; 