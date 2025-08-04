// BMECom Article Detail Page JavaScript

// DOM elements
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const articleDetailCard = document.getElementById('articleDetailCard');

// Like/Dislike tracking
let userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
let userDislikes = JSON.parse(localStorage.getItem('userDislikes')) || {};

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Get article ID from URL parameters
function getArticleId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load article data from localStorage
function loadArticleData(articleId) {
    try {
        // Fix: Use 'articles' key instead of 'userArticles'
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        return articles[articleId];
    } catch (error) {
        console.error('Error loading article data:', error);
        return null;
    }
}

// Like/Dislike functions
function likeArticle(articleUrl) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to like articles.', 'error');
        return;
    }
    
    // Remove from dislikes if previously disliked
    if (userDislikes[articleUrl] && userDislikes[articleUrl].includes(currentUser.id)) {
        userDislikes[articleUrl] = userDislikes[articleUrl].filter(id => id !== currentUser.id);
        if (userDislikes[articleUrl].length === 0) {
            delete userDislikes[articleUrl];
        }
        localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    }
    
    // Toggle like
    if (!userLikes[articleUrl]) {
        userLikes[articleUrl] = [];
    }
    
    const userIndex = userLikes[articleUrl].indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add like
        userLikes[articleUrl].push(currentUser.id);
        showMessage('Article liked!', 'success');
    } else {
        // Remove like
        userLikes[articleUrl].splice(userIndex, 1);
        if (userLikes[articleUrl].length === 0) {
            delete userLikes[articleUrl];
        }
        showMessage('Like removed.', 'info');
    }
    
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
    
    // Refresh the display
    const articleId = getArticleId();
    const article = loadArticleData(articleId);
    if (article) {
        displayArticleDetail(article);
    }
}

function dislikeArticle(articleUrl) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to dislike articles.', 'error');
        return;
    }
    
    // Remove from likes if previously liked
    if (userLikes[articleUrl] && userLikes[articleUrl].includes(currentUser.id)) {
        userLikes[articleUrl] = userLikes[articleUrl].filter(id => id !== currentUser.id);
        if (userLikes[articleUrl].length === 0) {
            delete userLikes[articleUrl];
        }
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
    }
    
    // Toggle dislike
    if (!userDislikes[articleUrl]) {
        userDislikes[articleUrl] = [];
    }
    
    const userIndex = userDislikes[articleUrl].indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add dislike
        userDislikes[articleUrl].push(currentUser.id);
        showMessage('Article disliked.', 'info');
    } else {
        // Remove dislike
        userDislikes[articleUrl].splice(userIndex, 1);
        if (userDislikes[articleUrl].length === 0) {
            delete userDislikes[articleUrl];
        }
        showMessage('Dislike removed.', 'info');
    }
    
    localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    
    // Refresh the display
    const articleId = getArticleId();
    const article = loadArticleData(articleId);
    if (article) {
        displayArticleDetail(article);
    }
}

function isArticleLikedByUser(articleUrl) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    return userLikes[articleUrl] && userLikes[articleUrl].includes(currentUser.id);
}

function isArticleDislikedByUser(articleUrl) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    return userDislikes[articleUrl] && userDislikes[articleUrl].includes(currentUser.id);
}

// Display article detail
function displayArticleDetail(article) {
    if (!article) {
        showError('Article not found');
        return;
    }

    const imageDisplay = article.image ? 
        `<div class="article-image">
            <img src="${article.image}" alt="${article.title}" onerror="this.style.display='none'">
        </div>` : '';

    const categoryDisplay = article.category ? 
        `<div class="article-category">${article.category}</div>` : '';

    // Like/Dislike buttons
    const isLiked = isArticleLikedByUser(article.url);
    const isDisliked = isArticleDislikedByUser(article.url);
    const likeCount = userLikes[article.url] ? userLikes[article.url].length : 0;
    const dislikeCount = userDislikes[article.url] ? userDislikes[article.url].length : 0;
    
    const likeButton = `
        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeArticle('${article.url}')" title="${isLiked ? 'Remove like' : 'Like article'}">
            <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
            <span class="like-count">${likeCount}</span>
        </button>
    `;
    
    const dislikeButton = `
        <button class="dislike-btn ${isDisliked ? 'disliked' : ''}" onclick="dislikeArticle('${article.url}')" title="${isDisliked ? 'Remove dislike' : 'Dislike article'}">
            <span class="dislike-icon">${isDisliked ? '💔' : '🖤'}</span>
            <span class="dislike-count">${dislikeCount}</span>
        </button>
    `;

    articleDetailCard.innerHTML = `
        <div class="article-header">
            ${categoryDisplay}
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <span class="article-source">${article.source}</span>
                <span>${article.date}</span>
            </div>
        </div>
        
        ${imageDisplay}
        
        <div class="article-abstract-section" id="abstractSection">
            <h2>Abstract</h2>
            <p>${article.summary}</p>
        </div>
        
        <div class="article-actions">
            <div class="like-dislike-buttons">
                ${likeButton}
                ${dislikeButton}
            </div>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-article-btn" id="readArticleBtn" style="display: none;">
                Read Full Article →
            </a>
            <a href="articles.html" class="back-btn">
                ← Back to Articles
            </a>
        </div>
    `;
    
    // Add click event to abstract section to show the article link
    const abstractSection = document.getElementById('abstractSection');
    const readArticleBtn = document.getElementById('readArticleBtn');
    
    if (abstractSection && readArticleBtn) {
        abstractSection.addEventListener('click', () => {
            readArticleBtn.style.display = 'inline-block';
        });
    }
}

// Show error message
function showError(message) {
    if (errorContainer) {
        errorContainer.innerHTML = `<p>${message}</p>`;
        errorContainer.style.display = 'block';
    }
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
}

// Show message
function showMessage(message, type = 'success') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#10b981';
    } else if (type === 'error') {
        messageDiv.style.background = '#ef4444';
    } else {
        messageDiv.style.background = '#6b7280';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Hide loading
function hideLoading() {
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const articleId = getArticleId();
    
    if (articleId === null) {
        showError('No article ID provided');
        return;
    }
    
    // Load article data
    const article = loadArticleData(articleId);
    
    if (article) {
        hideLoading();
        displayArticleDetail(article);
        articleDetailCard.style.display = 'block';
    } else {
        showError('Article not found');
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    }
}); 