// Simplified BMECom Articles JavaScript - Working Version

console.log('🔧 Loading Simplified BMECom Articles...');

// Global variables
let articles = JSON.parse(localStorage.getItem('articles')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
let userDislikes = JSON.parse(localStorage.getItem('userDislikes')) || {};
let articleComments = JSON.parse(localStorage.getItem('articleComments')) || {};

// DOM elements
const articlesGrid = document.getElementById('articlesGrid');
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const messageContainer = document.getElementById('messageContainer');
const loadingContainer = document.getElementById('loadingContainer');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const loginLink = document.getElementById('loginLink');
const logoutLink = document.getElementById('logoutLink');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing BMECom Articles...');
    
    // Check authentication
    checkAuthStatus();
    
    // Load articles
    loadArticles();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ BMECom Articles initialized successfully!');
});

// Setup event listeners
function setupEventListeners() {
    // URL form submission
    if (urlForm) {
        urlForm.addEventListener('submit', handleUrlSubmission);
    }
    
    // Login/logout links
    if (loginLink) {
        loginLink.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
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

// Handle URL submission
async function handleUrlSubmission(e) {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    if (!url) {
        showMessage('Please enter a URL', 'error');
        return;
    }
    
    // Check if user is logged in
    if (!currentUser) {
        showMessage('Please log in to add articles', 'error');
        return;
    }
    
    // Check if URL already exists
    if (isUrlAlreadyAdded(url)) {
        showMessage('This article has already been added', 'error');
        return;
    }
    
    try {
        showLoading();
        analyzeBtn.disabled = true;
        
        // Extract article data
        const articleData = await extractArticleData(url);
        
        // Add article
        addArticle(articleData);
        
        // Clear form
        urlInput.value = '';
        
        showMessage('Article added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding article:', error);
        showMessage('Failed to add article: ' + error.message, 'error');
    } finally {
        hideLoading();
        analyzeBtn.disabled = false;
    }
}

// Extract article data from URL
async function extractArticleData(url) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // Generate title from URL
        const urlPath = url.split('/').slice(3).join(' ');
        const urlWords = urlPath
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .split(' ')
            .filter(word => word.length > 2)
            .slice(0, 5);
        
        let title = 'Biomedical Engineering Article';
        if (urlWords.length > 0) {
            title = urlWords.map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
        }
        
        // Generate summary
        const summary = `This biomedical engineering research article from ${domain} explores cutting-edge developments in medical technology and healthcare innovation. The study presents novel approaches to addressing complex challenges in healthcare delivery through advanced engineering solutions. The research demonstrates significant advances in diagnostic tools, therapeutic interventions, and patient monitoring systems. Scientists utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The comprehensive analysis encompasses various aspects of biomedical engineering including device development, therapeutic applications, and clinical implementation strategies. The research team employed state-of-the-art experimental techniques and computational modeling to advance our understanding of biological systems and medical device interactions. Results indicate substantial improvements in treatment efficacy and patient safety, with promising applications in personalized medicine and targeted therapeutic delivery systems. These findings represent a significant milestone in the field of biomedical engineering, contributing to the advancement of medical science and healthcare delivery.`;
        
        // Generate image
        const image = `https://source.unsplash.com/800x400/?biomedical,engineering,medical,technology&t=${Date.now()}`;
        
        return {
            title,
            summary,
            image,
            source: domain,
            date: new Date().getFullYear().toString(),
            url,
            category: 'Biomedical Engineering',
            ticker: 1,
            userId: currentUser.id,
            userName: currentUser.name,
            dateAdded: new Date().toISOString(),
            likes: 0,
            dislikes: 0
        };
        
    } catch (error) {
        throw new Error('Invalid URL');
    }
}

// Add article to storage
function addArticle(articleData) {
    articles.push(articleData);
    localStorage.setItem('articles', JSON.stringify(articles));
    displayArticles();
}

// Load articles from storage
function loadArticles() {
    articles = JSON.parse(localStorage.getItem('articles')) || [];
    displayArticles();
}

// Display articles
function displayArticles() {
    if (!articlesGrid) return;
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No articles yet</h3>
                <p>Be the first to share an interesting article with the community!</p>
            </div>
        `;
        return;
    }
    
    articlesGrid.innerHTML = '';
    
    // Sort by most recent
    const sortedArticles = [...articles].sort((a, b) => 
        new Date(b.dateAdded) - new Date(a.dateAdded)
    );
    
    sortedArticles.forEach((article, index) => {
        const articleCard = createArticleCard(article, index);
        articlesGrid.appendChild(articleCard);
    });
}

// Create article card
function createArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    const isLiked = isArticleLikedByUser(article.url);
    const isDisliked = isArticleDislikedByUser(article.url);
    const commentCount = articleComments[article.url] ? articleComments[article.url].length : 0;
    
    card.innerHTML = `
        <div class="article-image">
            <img src="${article.image}" alt="${article.title}" loading="lazy" 
                 onerror="this.src='https://source.unsplash.com/800x400/?biomedical,engineering,medical,technology&t=' + Date.now();">
        </div>
        
        <div class="article-content">
            <h3 class="article-title">
                <a href="abstract-viewer.html?url=${encodeURIComponent(article.url)}">${article.title}</a>
            </h3>
            
            <p class="article-summary">${article.summary.substring(0, 200)}...</p>
            
            <div class="article-meta">
                <span class="article-source">${article.source}</span>
                <span>${article.date}</span>
            </div>
            
            <div class="article-actions">
                <div class="like-dislike-buttons">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeArticle(${index})">
                        👍 ${article.likes || 0}
                    </button>
                    <button class="dislike-btn ${isDisliked ? 'disliked' : ''}" onclick="dislikeArticle(${index})">
                        👎 ${article.dislikes || 0}
                    </button>
                </div>
                
                <a href="abstract-viewer.html?url=${encodeURIComponent(article.url)}" class="read-more-btn">
                    Read Full Abstract →
                </a>
            </div>
            
            <div class="comments-section">
                <button onclick="showComments(${index})" class="show-comments-btn">
                    💬 Comments (${commentCount})
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Like article
function likeArticle(index) {
    if (!currentUser) {
        showMessage('Please log in to like articles', 'error');
        return;
    }
    
    const article = articles[index];
    const normalizedUrl = normalizeUrl(article.url);
    
    if (userLikes[normalizedUrl]) {
        // Unlike
        delete userLikes[normalizedUrl];
        article.likes = Math.max(0, (article.likes || 0) - 1);
    } else {
        // Like
        userLikes[normalizedUrl] = true;
        article.likes = (article.likes || 0) + 1;
        
        // Remove dislike if exists
        if (userDislikes[normalizedUrl]) {
            delete userDislikes[normalizedUrl];
            article.dislikes = Math.max(0, (article.dislikes || 0) - 1);
        }
    }
    
    // Save to localStorage
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
    localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Refresh display
    displayArticles();
}

// Dislike article
function dislikeArticle(index) {
    if (!currentUser) {
        showMessage('Please log in to dislike articles', 'error');
        return;
    }
    
    const article = articles[index];
    const normalizedUrl = normalizeUrl(article.url);
    
    if (userDislikes[normalizedUrl]) {
        // Remove dislike
        delete userDislikes[normalizedUrl];
        article.dislikes = Math.max(0, (article.dislikes || 0) - 1);
    } else {
        // Dislike
        userDislikes[normalizedUrl] = true;
        article.dislikes = (article.dislikes || 0) + 1;
        
        // Remove like if exists
        if (userLikes[normalizedUrl]) {
            delete userLikes[normalizedUrl];
            article.likes = Math.max(0, (article.likes || 0) - 1);
        }
    }
    
    // Save to localStorage
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
    localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Refresh display
    displayArticles();
}

// Show comments
function showComments(index) {
    const article = articles[index];
    const comments = articleComments[article.url] || [];
    
    let commentsHtml = `
        <div class="comments-modal">
            <div class="comments-content">
                <h3>Comments for: ${article.title}</h3>
                <div class="comments-list">
    `;
    
    if (comments.length === 0) {
        commentsHtml += '<p>No comments yet. Be the first to comment!</p>';
    } else {
        comments.forEach(comment => {
            commentsHtml += `
                <div class="comment">
                    <strong>${comment.userName}</strong>
                    <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                    <p>${comment.text}</p>
                </div>
            `;
        });
    }
    
    commentsHtml += `
                </div>
                ${currentUser ? `
                    <div class="add-comment">
                        <textarea id="commentText" placeholder="Write a comment..."></textarea>
                        <button onclick="addComment(${index})">Add Comment</button>
                    </div>
                ` : '<p>Please log in to add comments</p>'}
                <button onclick="closeComments()" class="close-btn">Close</button>
            </div>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.innerHTML = commentsHtml;
    modal.id = 'commentsModal';
    document.body.appendChild(modal);
}

// Add comment
function addComment(index) {
    if (!currentUser) {
        showMessage('Please log in to add comments', 'error');
        return;
    }
    
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        showMessage('Please enter a comment', 'error');
        return;
    }
    
    const article = articles[index];
    const comment = {
        id: Date.now(),
        text: commentText,
        userName: currentUser.name,
        date: new Date().toISOString()
    };
    
    if (!articleComments[article.url]) {
        articleComments[article.url] = [];
    }
    articleComments[article.url].push(comment);
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    
    // Refresh comments
    closeComments();
    showComments(index);
}

// Close comments
function closeComments() {
    const modal = document.getElementById('commentsModal');
    if (modal) {
        modal.remove();
    }
}

// Utility functions
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
        normalized = normalized.replace(/\/$/, '');
        return normalized.toLowerCase();
    } catch (error) {
        return url.toLowerCase();
    }
}

function isUrlAlreadyAdded(url) {
    const normalizedUrl = normalizeUrl(url);
    return articles.some(article => normalizeUrl(article.url) === normalizedUrl);
}

function isArticleLikedByUser(articleUrl) {
    return !!userLikes[normalizeUrl(articleUrl)];
}

function isArticleDislikedByUser(articleUrl) {
    return !!userDislikes[normalizeUrl(articleUrl)];
}

function checkAuthStatus() {
    if (currentUser) {
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    if (userInfo) userInfo.style.display = 'block';
    if (userName) userName.textContent = currentUser.name;
    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
}

function updateUIForLoggedOutUser() {
    if (userInfo) userInfo.style.display = 'none';
    if (loginLink) loginLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    checkAuthStatus();
    showMessage('Logged out successfully', 'success');
}

function showMessage(message, type = 'success') {
    if (!messageContainer) return;
    
    messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(() => messageContainer.innerHTML = '', 5000);
}

function showLoading() {
    if (loadingContainer) loadingContainer.style.display = 'block';
    if (articlesGrid) articlesGrid.style.display = 'none';
}

function hideLoading() {
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (articlesGrid) articlesGrid.style.display = 'grid';
}

console.log('✅ Simplified BMECom Articles loaded successfully!'); 