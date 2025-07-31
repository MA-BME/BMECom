// BMECom Article Detail Page JavaScript

// DOM elements
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const articleDetailCard = document.getElementById('articleDetailCard');

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
        const userArticles = JSON.parse(localStorage.getItem('userArticles')) || [];
        return userArticles[articleId];
    } catch (error) {
        console.error('Error loading article data:', error);
        return null;
    }
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