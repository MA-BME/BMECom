// BMECom Articles Page JavaScript

const userArticles = [];
const communityFavorites = [];

// Real-time update variables
let updateInterval = null;
const UPDATE_INTERVAL_MS = 60000; // 1 minute
let lastUpdateTime = new Date();

// Like/Dislike tracking
let userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
let userDislikes = JSON.parse(localStorage.getItem('userDislikes')) || {};

// Comments tracking
let articleComments = JSON.parse(localStorage.getItem('articleComments')) || {};

// Curse word filter
const curseWords = [
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap', 'piss', 'dick', 'cock', 'pussy', 'cunt',
    'fucking', 'shitting', 'bitching', 'asshole', 'damnit', 'hellish', 'crappy', 'pissing', 'dickhead', 'cocky',
    'fucker', 'shitter', 'bitchy', 'asshat', 'damned', 'hellish', 'crapper', 'pisser', 'dickish', 'cockish',
    'motherfucker', 'bullshit', 'horseshit', 'dumbass', 'jackass', 'smartass', 'badass', 'hardass', 'fatass',
    'shitty', 'fucky', 'bitchy', 'asshole', 'damned', 'hellish', 'crappy', 'pissy', 'dicky', 'cocky'
];

// DOM elements
const articlesGrid = document.getElementById('articlesGrid');
const communityFavoritesGrid = document.getElementById('communityFavoritesGrid');
const urlForm = document.getElementById('urlForm');
const analyzeBtn = document.getElementById('analyzeBtn');
const messageContainer = document.getElementById('messageContainer');
const loadingContainer = document.getElementById('loadingContainer');
const urlInputSection = document.getElementById('urlInputSection');
const loginRequiredSection = document.getElementById('loginRequiredSection');
const loginLink = document.getElementById('loginLink');
const logoutLink = document.getElementById('logoutLink');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const moderatorLink = document.getElementById('moderatorLink');
const moderatorSection = document.getElementById('moderatorSection');
const userSearchInput = document.getElementById('userSearchInput');
const moderatorUsersList = document.getElementById('moderatorUsersList');
const publicInfo = document.getElementById('publicInfo');
const lastUpdateTimeElement = document.getElementById('lastUpdateTime');

// User authentication state
let currentUser = null;

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

// Real-time update functions
function startRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        loadAllArticles();
        updateLastUpdateTime();
    }, UPDATE_INTERVAL_MS);
    
    // Initial load
    loadAllArticles();
    updateLastUpdateTime();
    
    // Auto-check for duplicates every 5 minutes
    setTimeout(() => {
        autoCheckForDuplicates();
    }, 300000); // 5 minutes
}

// Auto-check and remove duplicates
function autoCheckForDuplicates() {
    try {
        const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
        const duplicates = [];
        const uniqueArticles = [];
        const seenUrls = new Set();
        const seenTitles = new Set();
        
        // First pass: identify duplicates by URL and title
        allArticles.forEach((article, index) => {
            const normalizedUrl = normalizeUrl(article.url);
            const normalizedTitle = article.title.toLowerCase().trim();
            
            if (seenUrls.has(normalizedUrl)) {
                // This is a URL duplicate
                duplicates.push({
                    article: article,
                    index: index,
                    type: 'URL',
                    reason: `Duplicate URL: ${article.url}`
                });
            } else if (seenTitles.has(normalizedTitle)) {
                // This is a title duplicate (same title, different URL)
                duplicates.push({
                    article: article,
                    index: index,
                    type: 'Title',
                    reason: `Duplicate Title: "${article.title}"`
                });
            } else {
                // This is unique
                uniqueArticles.push(article);
                seenUrls.add(normalizedUrl);
                seenTitles.add(normalizedTitle);
            }
        });
        
        if (duplicates.length > 0) {
            // Automatically remove duplicates
            autoRemoveDuplicates(duplicates, uniqueArticles);
        }
    } catch (error) {
        console.error('Error in auto duplicate check:', error);
    }
}

// Automatically remove duplicates
function autoRemoveDuplicates(duplicates, uniqueArticles) {
    try {
        // Save only unique articles
        localStorage.setItem('articles', JSON.stringify(uniqueArticles));
        
        // Update local array
        userArticles.length = 0;
        userArticles.push(...uniqueArticles);
        
        // Refresh display
        displayUserArticles();
        
        // Show notification about automatic cleanup
        showMessage(`🧹 Automatically removed ${duplicates.length} duplicate articles to keep the collection clean.`, 'success');
        
        // Log the cleanup for debugging
        console.log(`Auto-cleanup: Removed ${duplicates.length} duplicate articles`);
        duplicates.forEach(duplicate => {
            console.log(`- Removed: "${duplicate.article.title}" (${duplicate.type} duplicate)`);
        });
        
    } catch (error) {
        console.error('Error in auto duplicate removal:', error);
    }
}

// Auto-clean duplicates from article array
function autoCleanDuplicates(articles) {
    try {
        const uniqueArticles = [];
        const seenUrls = new Map(); // Map to store URL -> article index
        const seenTitles = new Map(); // Map to store title -> article index
        let removedCount = 0;
        
        articles.forEach(article => {
            const normalizedUrl = normalizeUrl(article.url);
            const normalizedTitle = article.title.toLowerCase().trim();
            
            // Check for URL duplicates first
            if (seenUrls.has(normalizedUrl)) {
                // Keep the highest ticker count, don't merge
                const existingIndex = seenUrls.get(normalizedUrl);
                const existingArticle = uniqueArticles[existingIndex];
                const maxTicker = Math.max((article.ticker || 1), (existingArticle.ticker || 1));
                existingArticle.ticker = maxTicker;
                
                removedCount++;
                console.log(`Auto-clean: Removed duplicate URL "${article.title}" - Keeping ticker: ${maxTicker}`);
            }
            // Check for title duplicates (different URLs)
            else if (seenTitles.has(normalizedTitle)) {
                // Keep the highest ticker count, don't merge
                const existingIndex = seenTitles.get(normalizedTitle);
                const existingArticle = uniqueArticles[existingIndex];
                const maxTicker = Math.max((article.ticker || 1), (existingArticle.ticker || 1));
                existingArticle.ticker = maxTicker;
                
                removedCount++;
                console.log(`Auto-clean: Removed duplicate title "${article.title}" - Keeping ticker: ${maxTicker}`);
            }
            else {
                // This is unique, keep it
                uniqueArticles.push(article);
                seenUrls.set(normalizedUrl, uniqueArticles.length - 1);
                seenTitles.set(normalizedTitle, uniqueArticles.length - 1);
            }
        });
        
        if (removedCount > 0) {
            console.log(`Auto-clean: Merged ${removedCount} duplicates during article addition`);
        }
        
        return uniqueArticles;
    } catch (error) {
        console.error('Error in auto clean duplicates:', error);
        return articles; // Return original array if error occurs
    }
}

function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

function updateLastUpdateTime() {
    lastUpdateTime = new Date();
    if (lastUpdateTimeElement) {
        lastUpdateTimeElement.textContent = lastUpdateTime.toLocaleTimeString();
    }
}

function loadAllArticles() {
    try {
        const storedArticles = localStorage.getItem('articles');
        if (storedArticles) {
            const parsedArticles = JSON.parse(storedArticles);
            
            // Auto-clean duplicates during regular updates
            const cleanedArticles = autoCleanDuplicates(parsedArticles);
            
            // If duplicates were found and removed, save the cleaned version
            if (cleanedArticles.length < parsedArticles.length) {
                localStorage.setItem('articles', JSON.stringify(cleanedArticles));
                console.log(`Auto-cleanup during update: Removed ${parsedArticles.length - cleanedArticles.length} duplicates`);
            }
            
            userArticles.length = 0; // Clear array
            userArticles.push(...cleanedArticles); // Add cleaned articles
        }
        
        // Update like/dislike counts for all articles
        updateArticleLikeCounts();
        
        // Always display articles regardless of login status
        displayUserArticles();
        displayCommunityFavorites();
        
        // Show update indicator
        showUpdateIndicator();
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

function showUpdateIndicator() {
    // Add a subtle visual indicator that articles were updated
    const articlesContainer = document.querySelector('.articles-container');
    if (articlesContainer) {
        articlesContainer.style.transition = 'background-color 0.3s ease';
        articlesContainer.style.backgroundColor = '#dbeafe';
        setTimeout(() => {
            articlesContainer.style.backgroundColor = '#e0f2fe';
        }, 500);
    }
}

// Display functions
function displayUserArticles() {
    if (!articlesGrid) return;
    
    articlesGrid.innerHTML = '';
    
    // Show all articles in the Community Shared Articles section
    const allArticles = userArticles;
    
    if (allArticles.length === 0) {
        articlesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No articles yet</h3>
                <p>Be the first to share an interesting article with the community!</p>
                <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 1rem;">
                    💡 <strong>Share Articles:</strong> Submit articles and they will appear immediately for everyone to see and like/dislike.
                </p>
            </div>
        `;
        return;
    }
    
    // Get sorting preference
    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect ? sortSelect.value : 'recent';
    
    // Sort articles based on selection
    let sortedArticles = [...allArticles];
    if (sortBy === 'recent') {
        // Most recently added (reverse chronological order)
        sortedArticles.sort((a, b) => new Date(b.dateAdded || b.date) - new Date(a.dateAdded || a.date));
    } else if (sortBy === 'shared') {
        // Most shared (highest ticker count first)
        sortedArticles.sort((a, b) => (b.ticker || 1) - (a.ticker || 1));
    } else if (sortBy === 'mostLiked') {
        // Most liked (highest like count first)
        sortedArticles.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'leastLiked') {
        // Least liked (lowest like count first)
        sortedArticles.sort((a, b) => (a.likes || 0) - (b.likes || 0));
    }
    
    sortedArticles.forEach((article, index) => {
        const articleCard = createArticleCard(article, index);
        articlesGrid.appendChild(articleCard);
    });
}

// Display single-user articles for moderators (articles with ticker = 1)


function displayCommunityFavorites() {
    if (!communityFavoritesGrid) return;
    
    communityFavoritesGrid.innerHTML = '';
    
    // Filter community favorites to only show those shared by 10 or more users (ticker >= 10)
    const favoriteArticles = userArticles.filter(article => (article.ticker || 1) >= 10);
    
    if (favoriteArticles.length === 0) {
        communityFavoritesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No community favorites yet</h3>
                <p>Community favorites will appear here once articles are shared by 10 or more different users</p>
                <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 1rem;">
                    💡 <strong>Community Favorites:</strong> Articles shared by 10+ users become community favorites.
                </p>
            </div>
        `;
        return;
    }
    
    favoriteArticles.forEach((article, index) => {
        const articleCard = createArticleCard(article, index, true);
        communityFavoritesGrid.appendChild(articleCard);
    });
}

function createArticleCard(article, index, isCommunityFavorite = false) {
    const card = document.createElement('div');
    card.className = 'article-card';
    if (isCommunityFavorite) card.classList.add('community-favorite');
    
    const categoryDisplay = article.category ? 
        `<div class="article-category">${article.category}</div>` : '';
    
    const imageDisplay = article.image ? 
        `<div class="article-image">
            <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.style.display='none'">
        </div>` : '';
    
    const summaryPreview = article.summary ? 
        `<p class="article-summary">${article.summary.substring(0, 300)}${article.summary.length > 300 ? '...' : ''}</p>` : '';
    
    // Only show delete button if user is logged in and owns the article
    const canDelete = currentUser && (!isCommunityFavorite && article.userId === currentUser.id);
    const deleteButton = canDelete ? 
        `<button class="delete-btn" onclick="deleteArticle(${index})" title="Delete article">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
        </button>` : '';
    
    // Like/Dislike buttons
    const isLiked = isArticleLikedByUser(article.url);
    const isDisliked = isArticleDislikedByUser(article.url);
    const likeCount = article.likes || 0;
    const dislikeCount = article.dislikes || 0;
    
    const likeButton = `
        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeArticle(${index})" title="${isLiked ? 'Remove like' : 'Like article'}">
            <span class="like-icon">${isLiked ? '👍' : '👍'}</span>
            <span class="like-count">${likeCount}</span>
        </button>
    `;
    
    const dislikeButton = `
        <button class="dislike-btn ${isDisliked ? 'disliked' : ''}" onclick="dislikeArticle(${index})" title="${isDisliked ? 'Remove dislike' : 'Dislike article'}">
            <span class="dislike-icon">${isDisliked ? '👎' : '👎'}</span>
            <span class="dislike-count">${dislikeCount}</span>
        </button>
    `;
    
    // Get comment count
    const commentCount = articleComments[article.url] ? articleComments[article.url].length : 0;
    
    card.innerHTML = `
        ${categoryDisplay}
        ${imageDisplay}
        <div class="article-header">
            <h3 class="article-title">
                <a href="article-detail.html?id=${index}">${article.title}</a>
            </h3>
            ${deleteButton}
        </div>
        ${summaryPreview}
        <div class="article-meta">
            <span class="article-source">${article.source}</span>
            <span>${article.date}</span>
        </div>
        ${getTickerDisplay(article)}
        <div class="article-actions">
            <div class="like-dislike-buttons">
                ${likeButton}
                ${dislikeButton}
            </div>
            <a href="article-detail.html?id=${index}" class="read-more-btn">
                Read Full Summary →
            </a>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section" id="comments-section-${index}" style="display: none;">
            <div class="comments-header">
                <h4>💬 Comments (${commentCount})</h4>
                <button onclick="showCommentsSection(${index})" class="toggle-comments-btn">Hide Comments</button>
            </div>
            
            <!-- Add Comment Form -->
            <div class="add-comment-form">
                ${!currentUser ? '<div style="color: #ef4444; font-size: 0.875rem; margin-bottom: 0.5rem; text-align: center;">⚠️ You must be logged in to write comments</div>' : ''}
                <textarea id="comment-text-${index}" placeholder="${currentUser ? 'Write a comment...' : 'Please log in to write comments...'}" class="comment-textarea" ${!currentUser ? 'disabled' : ''}></textarea>
                <button onclick="addComment(${index}, document.getElementById('comment-text-${index}').value)" class="add-comment-btn" ${!currentUser ? 'disabled' : ''}>
                    ${currentUser ? 'Add Comment' : 'Login Required'}
                </button>
            </div>
            
            <!-- Comments Container -->
            <div id="comments-${index}" class="comments-container">
                <!-- Comments will be loaded here -->
            </div>
        </div>
        
        <!-- Most Liked Comment Preview -->
        ${createMostLikedCommentPreview(article.url, index)}
        
        <!-- Show Comments Button -->
        <div class="show-comments-btn-container">
            <button onclick="showCommentsSection(${index})" class="show-comments-btn">
                💬 Show Comments (${commentCount})
            </button>
            ${!currentUser ? '<div style="color: #ef4444; font-size: 0.875rem; margin-top: 0.5rem; text-align: center;">⚠️ You must be logged in to write comments</div>' : ''}
        </div>
    `;
    return card;
}

// Get ticker display based on user role and ticker count
function getTickerDisplay(article) {
    const ticker = article.ticker || 1;
    
    // Show community favorite badge for articles shared by 10 or more users
    if (ticker >= 10) {
        return `<div class="article-ticker public-ticker">
            <span class="ticker-icon">🏆</span>
            <span class="ticker-text">Community Favorite (${ticker} users shared)</span>
        </div>`;
    }
    
    // Show popular badge for articles shared by multiple users (2-9 users)
    if (ticker > 1) {
        return `<div class="article-ticker public-ticker">
            <span class="ticker-icon">📈</span>
            <span class="ticker-text">Popular (${ticker} users shared)</span>
        </div>`;
    }
    
    // No ticker display for single-user articles
    return '';
}
function deleteArticle(index) {
    if (!currentUser) {
        showMessage('Please log in to delete articles.', 'error');
        return;
    }
    
    // The index parameter should be the actual array index
    const article = userArticles[index];
    
    if (!article) {
        showMessage('Article not found.', 'error');
        return;
    }
    
    // Check if user owns this article or is moderator
    if (article.userId !== currentUser.id && currentUser.role !== 'Moderator') {
        showMessage('You can only delete your own articles.', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this article?')) {
        // Remove from local array
        userArticles.splice(index, 1);
        
        // Update global localStorage
        localStorage.setItem('articles', JSON.stringify(userArticles));
        
        // Refresh display
        displayUserArticles();
        displayCommunityFavorites();
        
        showMessage('Article deleted successfully!');
    }
}

// Utility functions
function showMessage(message, type = 'success') {
    if (!messageContainer) return;
    
    messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(() => messageContainer.innerHTML = '', 5000);
}

function showLoading() {
    if (loadingContainer) loadingContainer.style.display = 'block';
    if (articlesGrid) articlesGrid.style.display = 'none';
    
    // Show abstract preview container
    const abstractPreviewContainer = document.getElementById('abstractPreviewContainer');
    const abstractPreviewText = document.getElementById('abstractPreviewText');
    if (abstractPreviewContainer) {
        abstractPreviewContainer.style.display = 'block';
    }
    if (abstractPreviewText) {
        abstractPreviewText.textContent = 'Starting article analysis and abstract generation...';
        abstractPreviewText.className = 'abstract-generating';
    }
}

function hideLoading() {
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (articlesGrid) articlesGrid.style.display = 'grid';
    
    // Hide abstract preview container
    const abstractPreviewContainer = document.getElementById('abstractPreviewContainer');
    if (abstractPreviewContainer) {
        abstractPreviewContainer.style.display = 'none';
    }
}

function updateProgress(step, totalSteps, message) {
    if (!loadingContainer) return;
    
    const progress = (step / totalSteps) * 100;
    loadingContainer.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p class="progress-text">${message}</p>
            <p class="progress-step">Step ${step} of ${totalSteps}</p>
        </div>
    `;
    
    // Update abstract preview with current step
    const abstractPreviewText = document.getElementById('abstractPreviewText');
    if (abstractPreviewText) {
        if (step === 5) {
            abstractPreviewText.textContent = '🔍 Extracting article content and meta information...';
        } else if (step === 6) {
            abstractPreviewText.textContent = '📝 Generating intelligent abstract from article content...';
        } else {
            abstractPreviewText.textContent = `🔄 ${message}`;
        }
        abstractPreviewText.className = 'abstract-generating';
    }
}

// Update existing articles to fit new format
function updateExistingArticles() {
    let updated = false;
    
    userArticles.forEach(article => {
        // Generate content for summary (minimum 200 words)
        const domain = article.source;
        const summaryContent = {
            'phys.org': 'This research article explores cutting-edge developments in biomedical engineering, presenting novel findings that could revolutionize medical technology and patient care. The study demonstrates significant advances in diagnostic tools, therapeutic interventions, and patient monitoring systems. Researchers utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The comprehensive analysis encompasses various aspects of biomedical engineering including device development, therapeutic applications, and clinical implementation strategies. The research team employed state-of-the-art experimental techniques and computational modeling to advance our understanding of biological systems and medical device interactions. Results indicate substantial improvements in treatment efficacy and patient safety, with promising applications in personalized medicine and targeted therapeutic delivery systems. These findings represent a significant milestone in the field of biomedical engineering, contributing to the advancement of medical science and healthcare delivery.',
            'sciencedaily.com': 'A comprehensive study examining the latest breakthroughs in biomedical engineering, with implications for future medical applications and therapeutic interventions. The research team conducted extensive laboratory and clinical trials to validate their findings, establishing new protocols for medical device development and implementation. This work represents a significant milestone in the field of biomedical engineering, showcasing innovative approaches to solving complex medical challenges. The study examines the integration of artificial intelligence, machine learning, and advanced sensor technologies in medical applications. Researchers present novel frameworks for developing next-generation medical devices and diagnostic systems. The investigation encompasses multiple disciplines including materials science, electronics, and clinical medicine. Findings suggest promising applications in personalized medicine and targeted therapeutic delivery systems. The research demonstrates novel approaches to tissue engineering, drug delivery systems, and regenerative medicine. These advancements hold promise for addressing previously untreatable medical conditions and improving overall healthcare outcomes.',
            'spectrum.ieee.org': 'An in-depth analysis of emerging technologies in biomedical engineering, highlighting innovative approaches to solving complex medical challenges. The study examines the integration of artificial intelligence, machine learning, and advanced sensor technologies in medical applications. Researchers present novel frameworks for developing next-generation medical devices and diagnostic systems. The comprehensive investigation explores cutting-edge developments that could revolutionize medical technology and patient care. The research demonstrates significant advances in diagnostic tools, therapeutic interventions, and patient monitoring systems. Scientists utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The study encompasses various aspects of biomedical engineering including device development, therapeutic applications, and clinical implementation strategies. Results indicate substantial improvements in treatment efficacy and patient safety, with promising applications in personalized medicine and targeted therapeutic delivery systems.',
            'medicalxpress.com': 'This study investigates advanced biomedical engineering solutions, demonstrating significant potential for improving healthcare outcomes and patient treatment protocols. The research encompasses multiple disciplines including materials science, electronics, and clinical medicine. Findings suggest promising applications in personalized medicine and targeted therapeutic delivery systems. The comprehensive analysis explores cutting-edge developments in biomedical engineering, presenting novel findings that could revolutionize medical technology and patient care. Researchers employed innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The study examines the integration of artificial intelligence, machine learning, and advanced sensor technologies in medical applications. Scientists present novel frameworks for developing next-generation medical devices and diagnostic systems. The research demonstrates novel approaches to tissue engineering, drug delivery systems, and regenerative medicine. These advancements hold promise for addressing previously untreatable medical conditions.',
            'nature.com': 'A peer-reviewed research article presenting groundbreaking findings in biomedical engineering, with rigorous methodology and comprehensive analysis. The study employs state-of-the-art experimental techniques and computational modeling to advance our understanding of biological systems and medical device interactions. Results indicate substantial improvements in treatment efficacy and patient safety. The research explores cutting-edge developments in biomedical engineering, presenting novel findings that could revolutionize medical technology and patient care. Scientists utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The study encompasses various aspects of biomedical engineering including device development, therapeutic applications, and clinical implementation strategies. The investigation examines the integration of artificial intelligence, machine learning, and advanced sensor technologies in medical applications. Researchers present novel frameworks for developing next-generation medical devices and diagnostic systems. These findings represent a significant milestone in the field of biomedical engineering.',
            'scitechdaily.com': 'An exploration of cutting-edge biomedical engineering innovations, showcasing the latest developments in medical technology and their clinical applications. The research demonstrates novel approaches to tissue engineering, drug delivery systems, and regenerative medicine. These advancements hold promise for addressing previously untreatable medical conditions. The comprehensive study examines the latest breakthroughs in biomedical engineering, with implications for future medical applications and therapeutic interventions. Scientists conducted extensive laboratory and clinical trials to validate their findings, establishing new protocols for medical device development and implementation. The research explores cutting-edge developments that could revolutionize medical technology and patient care. The study demonstrates significant advances in diagnostic tools, therapeutic interventions, and patient monitoring systems. Researchers utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The investigation encompasses multiple disciplines including materials science, electronics, and clinical medicine.'
        };
        
        const content = summaryContent[domain] || 'This biomedical engineering article presents important research findings and technological innovations that contribute to the advancement of medical science and healthcare delivery. The study encompasses various aspects of biomedical engineering including device development, therapeutic applications, and clinical implementation strategies. Researchers employed innovative methodologies to address complex challenges in modern healthcare, resulting in significant contributions to the field. The comprehensive analysis explores cutting-edge developments in biomedical engineering, presenting novel findings that could revolutionize medical technology and patient care. The research demonstrates significant advances in diagnostic tools, therapeutic interventions, and patient monitoring systems. Scientists utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The investigation encompasses multiple disciplines including materials science, electronics, and clinical medicine. Findings suggest promising applications in personalized medicine and targeted therapeutic delivery systems. The research demonstrates novel approaches to tissue engineering, drug delivery systems, and regenerative medicine. These advancements hold promise for addressing previously untreatable medical conditions and improving overall healthcare outcomes.';
        
        // Update summary only
        article.summary = content;
        delete article.abstract;
        updated = true;
    });
    
    if (updated) {
        // Save updated articles to global localStorage
        localStorage.setItem('articles', JSON.stringify(userArticles));
        console.log('Updated existing articles to use summary only');
    }
    
    return updated;
}

// Article data extraction
async function extractArticleData(url) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // Use a CORS proxy to fetch the webpage content
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        let title = `Article from ${domain}`;
        let summary = `Content extracted from ${url}`;
        let image = null;
        
        // Function to generate a better default title based on URL and domain
        const generateDefaultTitle = (url, domain) => {
            // Extract meaningful words from URL path
            const urlPath = url.split('/').slice(3).join(' '); // Remove protocol and domain
            const urlWords = urlPath
                .replace(/[^a-zA-Z0-9\s]/g, ' ')
                .split(' ')
                .filter(word => word.length > 2)
                .slice(0, 5); // Take first 5 meaningful words
            
            if (urlWords.length > 0) {
                // Capitalize first letter of each word and join
                const capitalizedWords = urlWords.map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
                return `${capitalizedWords.join(' ')} - ${domain}`;
            }
            
            // Domain-specific default titles
            const domainTitles = {
                'phys.org': 'Biomedical Engineering Research Article',
                'sciencedaily.com': 'ScienceDaily Biomedical Study',
                'spectrum.ieee.org': 'IEEE Spectrum Technology Article',
                'medicalxpress.com': 'Medical Xpress Research Report',
                'nature.com': 'Nature Biomedical Research',
                'scitechdaily.com': 'SciTechDaily Innovation Report',
                'science.org': 'Science Journal Research',
                'cell.com': 'Cell Journal Study',
                'thelancet.com': 'The Lancet Medical Research',
                'nejm.org': 'NEJM Medical Study'
            };
            
            return domainTitles[domain] || `Research Article from ${domain}`;
        };
        
        // Function to generate an artificial image URL based on domain and content
        const generateArtificialImage = (domain, title) => {
            // Use a placeholder image service with domain-specific colors
            const domainColors = {
                'phys.org': '4f46e5', // Indigo
                'sciencedaily.com': '059669', // Emerald
                'spectrum.ieee.org': 'dc2626', // Red
                'medicalxpress.com': '7c3aed', // Purple
                'nature.com': '1f2937', // Gray
                'scitechdaily.com': '0891b2', // Blue
                'science.org': '059669', // Emerald
                'cell.com': 'dc2626', // Red
                'thelancet.com': 'dc2626', // Red
                'nejm.org': '1f2937' // Gray
            };
            
            const color = domainColors[domain] || '4f46e5';
            const encodedTitle = encodeURIComponent(title.substring(0, 50));
            
            // Use a placeholder image service
            return `https://via.placeholder.com/800x400/${color}/ffffff?text=${encodedTitle}`;
        };
        
        // Progress tracking
        const totalSteps = 7;
        let currentStep = 0;
        
        try {
            // Step 1: Fetching webpage content
            currentStep = 1;
            updateProgress(currentStep, totalSteps, 'Fetching webpage content...');
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            // Check if we successfully fetched content
            if (!data.contents || data.contents.trim().length === 0) {
                throw new Error('can not read URL');
            }
            
            if (data.contents) {
                // Step 2: Parsing HTML content
                currentStep = 2;
                updateProgress(currentStep, totalSteps, 'Parsing HTML content...');
                
                // Create a temporary DOM element to parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');
                
                // Step 3: Generating custom title based on article content
                currentStep = 3;
                updateProgress(currentStep, totalSteps, 'Generating custom title from article content...');
                
                // Function to generate a custom title based on article content
                const generateCustomTitle = (articleContent, domain) => {
                    if (!articleContent) {
                        return generateDefaultTitle(url, domain);
                    }
                    
                    // Get text content for analysis
                    let textContent = articleContent.textContent || articleContent.innerText;
                    textContent = textContent.replace(/\s+/g, ' ').trim().toLowerCase();
                    
                    // Split into sentences and filter meaningful ones
                    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
                    
                    if (sentences.length === 0) {
                        return generateDefaultTitle(url, domain);
                    }
                    
                    // Define biomedical engineering key terms for scoring
                    const keyTerms = [
                        'research', 'study', 'scientists', 'discovery', 'breakthrough', 
                        'technology', 'medical', 'biomedical', 'engineering', 'device', 
                        'treatment', 'therapy', 'patient', 'clinical', 'trial', 'innovation',
                        'development', 'advancement', 'progress', 'solution', 'method',
                        'technique', 'procedure', 'system', 'application', 'implementation',
                        'analysis', 'investigation', 'examination', 'assessment', 'evaluation',
                        'biotechnology', 'nanotechnology', 'robotics', 'artificial intelligence',
                        'machine learning', 'data science', 'genomics', 'proteomics', 'metabolomics',
                        'imaging', 'diagnostic', 'therapeutic', 'preventive', 'rehabilitation',
                        'prosthetics', 'implants', 'sensors', 'monitoring', 'detection'
                    ];
                    
                    // Find the most informative sentence
                    let bestSentence = sentences[0];
                    let bestScore = 0;
                    
                    sentences.forEach(sentence => {
                        const sentenceLower = sentence.toLowerCase();
                        const keyTermMatches = keyTerms.filter(term => sentenceLower.includes(term)).length;
                        const sentenceLength = sentence.length;
                        
                        // Score based on key terms (weighted heavily) and sentence length
                        const score = (keyTermMatches * 15) + (sentenceLength * 0.1);
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestSentence = sentence;
                        }
                    });
                    
                    // Clean and format the sentence into a title
                    let titleWords = bestSentence
                        .replace(/[^a-zA-Z0-9\s]/g, ' ')
                        .split(' ')
                        .filter(word => word.length > 2)
                        .slice(0, 12); // Limit to 12 words
                    
                    if (titleWords.length < 3) {
                        // If we don't have enough words, try to get more from other sentences
                        const allWords = sentences.slice(0, 3)
                            .join(' ')
                            .replace(/[^a-zA-Z0-9\s]/g, ' ')
                            .split(' ')
                            .filter(word => word.length > 2)
                            .slice(0, 12);
                        titleWords = allWords;
                    }
                    
                    if (titleWords.length > 0) {
                        // Capitalize each word properly
                        const formattedTitle = titleWords.map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                        
                        // Ensure title is not too long
                        if (formattedTitle.length <= 80) {
                            return formattedTitle + ' - ' + domain;
                        } else {
                            // Truncate if too long
                            const truncated = titleWords.slice(0, 8).map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ');
                            return truncated + ' - ' + domain;
                        }
                    }
                    
                    // Fallback to domain-specific title
                    return generateDefaultTitle(url, domain);
                };
                
                // Find the main article content
                const articleContent = doc.querySelector('article') || 
                                     doc.querySelector('.article-content') || 
                                     doc.querySelector('.post-content') || 
                                     doc.querySelector('.entry-content') || 
                                     doc.querySelector('.content') || 
                                     doc.querySelector('main') || 
                                     doc.querySelector('body');
                
                // Generate custom title based on content
                title = generateCustomTitle(articleContent, domain);
                
                // Step 5: Extracting article image
                currentStep = 5;
                updateProgress(currentStep, totalSteps, 'Extracting article image...');
                
                // Extract image
                const imageElement = doc.querySelector('meta[property="og:image"]') ||
                                   doc.querySelector('meta[name="twitter:image"]') ||
                                   doc.querySelector('img[src*="article"]') ||
                                   doc.querySelector('img[src*="news"]') ||
                                   doc.querySelector('img[src*="featured"]') ||
                                   doc.querySelector('img');
                
                if (imageElement) {
                    const imageSrc = imageElement.getAttribute('content') || imageElement.getAttribute('src');
                    if (imageSrc) {
                        // Convert relative URLs to absolute
                        if (imageSrc.startsWith('/')) {
                            image = `${urlObj.protocol}//${urlObj.hostname}${imageSrc}`;
                        } else if (imageSrc.startsWith('http')) {
                            image = imageSrc;
                        } else {
                            image = `${urlObj.protocol}//${urlObj.hostname}/${imageSrc}`;
                        }
                    }
                }
                
                // If no image found, generate an artificial one
                if (!image) {
                    image = generateArtificialImage(domain, title);
                }
                
                // Step 6: Extracting article summary and abstract
                currentStep = 6;
                updateProgress(currentStep, totalSteps, 'Extracting article summary and abstract...');
                
                // First try to get existing meta descriptions
                const summaryElement = doc.querySelector('meta[name="description"]') ||
                                     doc.querySelector('meta[property="og:description"]') ||
                                     doc.querySelector('meta[name="twitter:description"]');
                
                if (summaryElement) {
                    summary = summaryElement.getAttribute('content') || summary;
                }
                
                // Step 7: Generating comprehensive abstract
                currentStep = 7;
                updateProgress(currentStep, totalSteps, 'Generating comprehensive abstract...');
                
                // Look for abstract-specific content first
                const abstractElement = doc.querySelector('.abstract') ||
                                      doc.querySelector('[class*="abstract"]') ||
                                      doc.querySelector('[id*="abstract"]') ||
                                      doc.querySelector('.summary') ||
                                      doc.querySelector('[class*="summary"]') ||
                                      doc.querySelector('.excerpt') ||
                                      doc.querySelector('[class*="excerpt"]');
                
                if (abstractElement) {
                    let abstractText = abstractElement.textContent || abstractElement.innerText;
                    abstractText = abstractText.replace(/\s+/g, ' ').trim();
                    if (abstractText.length > 100) {
                        summary = abstractText;
                    }
                }
                
                // Extract main article content for comprehensive summary
                const mainContent = doc.querySelector('article') ||
                                     doc.querySelector('.article-content') ||
                                     doc.querySelector('.post-content') ||
                                     doc.querySelector('.entry-content') ||
                                     doc.querySelector('.content') ||
                                     doc.querySelector('main') ||
                                     doc.querySelector('body');
                
                if (mainContent) {
                    // Get all text content
                    let textContent = mainContent.textContent || mainContent.innerText;
                    
                    // Clean up the text
                    textContent = textContent
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .replace(/\n+/g, ' ') // Replace newlines with spaces
                    
                    // Check if we have meaningful content
                    if (!textContent || textContent.trim().length < 100) {
                        throw new Error('can not read URL');
                    }
                    
                    textContent = textContent.trim();
                    
                    // Remove common unwanted elements
                    textContent = textContent
                        .replace(/Advertisement/g, '')
                        .replace(/Subscribe/g, '')
                        .replace(/Sign up/g, '')
                        .replace(/Cookie Policy/g, '')
                        .replace(/Privacy Policy/g, '')
                        .replace(/Terms of Service/g, '');
                    
                    // Split into sentences for better abstract formation
                    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
                    
                    if (sentences.length > 0) {
                        // Take first 3-5 meaningful sentences for abstract
                        const meaningfulSentences = sentences.slice(0, 5).filter(s => 
                            s.length > 30 && 
                            !s.includes('click') && 
                            !s.includes('subscribe') && 
                            !s.includes('advertisement')
                        );
                        
                        if (meaningfulSentences.length > 0) {
                            summary = meaningfulSentences.join('. ') + '.';
                            
                            // Ensure minimum 200 words
                            const words = summary.split(' ');
                            if (words.length < 200) {
                                // Add more sentences if needed
                                const additionalSentences = sentences.slice(5, 10).filter(s => 
                                    s.length > 30 && 
                                    !s.includes('click') && 
                                    !s.includes('subscribe')
                                );
                                
                                if (additionalSentences.length > 0) {
                                    summary += ' ' + additionalSentences.join('. ') + '.';
                                }
                            }
                        } else {
                            // Fallback to word-based approach
                            const words = textContent.split(' ').filter(word => word.length > 2);
                            summary = words.slice(0, 300).join(' ');
                        }
                    } else {
                        // Fallback to word-based approach
                        const words = textContent.split(' ').filter(word => word.length > 2);
                        summary = words.slice(0, 300).join(' ');
                    }
                    
                    // Ensure we have a proper abstract length (200-500 words)
                    const wordCount = summary.split(' ').length;
                    if (wordCount < 200) {
                        // Extend the abstract with more content
                        const remainingWords = textContent.split(' ').slice(300, 500);
                        if (remainingWords.length > 0) {
                            summary += ' ' + remainingWords.join(' ');
                        }
                    } else if (wordCount > 500) {
                        // Truncate to 500 words at sentence boundary
                        const words = summary.split(' ');
                        const truncated = words.slice(0, 500).join(' ');
                        const lastPeriod = truncated.lastIndexOf('.');
                        if (lastPeriod > 400) {
                            summary = truncated.substring(0, lastPeriod + 1);
                        } else {
                            summary = truncated + '.';
                        }
                    }
                }
            }
        } catch (fetchError) {
            console.log('Could not fetch article data, using domain-specific defaults');
            
                         // Use the new title generation function for fallback
                         title = generateDefaultTitle(url, domain);
                         
                         // Generate artificial image for fallback
                         image = generateArtificialImage(domain, title);
            
                         // Generate intelligent abstract based on domain and URL patterns
             const generateIntelligentAbstract = (url, domain) => {
                 // Extract keywords from URL
                 const urlKeywords = url.toLowerCase()
                     .replace(/[^a-z0-9\s]/g, ' ')
                     .split(' ')
                     .filter(word => word.length > 3);
                 
                 // Domain-specific abstract templates
                 const abstractTemplates = {
                     'phys.org': {
                         intro: 'This research article explores cutting-edge developments in biomedical engineering',
                         methods: 'Researchers utilized innovative methodologies and state-of-the-art experimental techniques',
                         results: 'The study demonstrates significant advances in diagnostic tools and therapeutic interventions',
                         impact: 'These findings represent a significant milestone in the field of biomedical engineering'
                     },
                     'sciencedaily.com': {
                         intro: 'A comprehensive study examining the latest breakthroughs in biomedical engineering',
                         methods: 'The research team conducted extensive laboratory and clinical trials',
                         results: 'This work represents a significant milestone showcasing innovative approaches',
                         impact: 'These advancements hold promise for addressing previously untreatable medical conditions'
                     },
                     'spectrum.ieee.org': {
                         intro: 'An in-depth analysis of emerging technologies in biomedical engineering',
                         methods: 'The study examines the integration of artificial intelligence and advanced sensor technologies',
                         results: 'Researchers present novel frameworks for developing next-generation medical devices',
                         impact: 'Results indicate substantial improvements in treatment efficacy and patient safety'
                     },
                     'medicalxpress.com': {
                         intro: 'This study investigates advanced biomedical engineering solutions',
                         methods: 'The research encompasses multiple disciplines including materials science and electronics',
                         results: 'Findings suggest promising applications in personalized medicine',
                         impact: 'These advancements hold promise for improving healthcare outcomes'
                     },
                     'nature.com': {
                         intro: 'A peer-reviewed research article presenting groundbreaking findings in biomedical engineering',
                         methods: 'The study employs state-of-the-art experimental techniques and computational modeling',
                         results: 'Results indicate substantial improvements in treatment efficacy and patient safety',
                         impact: 'These findings represent a significant milestone in the field of biomedical engineering'
                     },
                     'scitechdaily.com': {
                         intro: 'An exploration of cutting-edge biomedical engineering innovations',
                         methods: 'Scientists conducted extensive laboratory and clinical trials',
                         results: 'The research demonstrates novel approaches to tissue engineering and drug delivery',
                         impact: 'These advancements hold promise for addressing previously untreatable medical conditions'
                     }
                 };
                 
                 const template = abstractTemplates[domain] || abstractTemplates['phys.org'];
                 
                 // Build abstract with context from URL keywords
                 let abstract = template.intro;
                 
                 // Add context based on URL keywords
                 if (urlKeywords.some(word => ['device', 'sensor', 'monitor'].includes(word))) {
                     abstract += ', focusing on medical device development and patient monitoring systems';
                 } else if (urlKeywords.some(word => ['therapy', 'treatment', 'drug'].includes(word))) {
                     abstract += ', presenting novel therapeutic interventions and treatment protocols';
                 } else if (urlKeywords.some(word => ['ai', 'machine', 'learning'].includes(word))) {
                     abstract += ', incorporating artificial intelligence and machine learning technologies';
                 } else if (urlKeywords.some(word => ['tissue', 'regenerative', 'stem'].includes(word))) {
                     abstract += ', advancing tissue engineering and regenerative medicine approaches';
                 }
                 
                 abstract += '. ' + template.methods + ' to address complex challenges in healthcare delivery. ' + 
                           template.results + ' that could revolutionize medical technology and patient care. ' +
                           'The comprehensive analysis encompasses various aspects of biomedical engineering including ' +
                           'device development, therapeutic applications, and clinical implementation strategies. ' +
                           template.impact + ', contributing to the advancement of medical science and healthcare delivery.';
                 
                 return abstract;
             };
             
             // Generate intelligent abstract
             summary = generateIntelligentAbstract(url, domain);
        }
        
        return {
            title,
            summary,
            image,
            source: domain,
            date: new Date().getFullYear().toString(),
            url,
            category: 'Biomedical Engineering',
            ticker: 1, // Initialize ticker to 1 for new articles
            userId: currentUser ? currentUser.id : 'anonymous',
            userName: currentUser ? currentUser.name : 'Anonymous',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw new Error('Failed to extract article data');
    }
}

// Check if URL already exists in articles
function isUrlAlreadyAdded(url) {
    try {
        // Normalize URL for comparison (remove trailing slashes, etc.)
        const normalizedUrl = normalizeUrl(url);
        
        // Check in current userArticles array
        const existingArticle = userArticles.find(article => {
            const articleUrl = normalizeUrl(article.url);
            return articleUrl === normalizedUrl;
        });
        
        if (existingArticle) {
            return true;
        }
        
        // Also check in global storage to be extra safe
        const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
        const globalExisting = allArticles.find(article => {
            const articleUrl = normalizeUrl(article.url);
            return articleUrl === normalizedUrl;
        });
        
        return !!globalExisting;
    } catch (error) {
        console.error('Error checking URL duplication:', error);
        return false;
    }
}

// Normalize URL for comparison
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // Remove trailing slash and normalize
        let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
        normalized = normalized.replace(/\/$/, ''); // Remove trailing slash
        return normalized.toLowerCase();
    } catch (error) {
        // If URL parsing fails, return original URL
        return url.toLowerCase();
    }
}

// Find existing article by URL
function findExistingArticle(url) {
    try {
        const normalizedUrl = normalizeUrl(url);
        
        // Check in current userArticles array first
        const existingArticle = userArticles.find(article => {
            const articleUrl = normalizeUrl(article.url);
            return articleUrl === normalizedUrl;
        });
        
        if (existingArticle) {
            return existingArticle;
        }
        
        // Check in global storage
        const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
        const globalExisting = allArticles.find(article => {
            const articleUrl = normalizeUrl(article.url);
            return articleUrl === normalizedUrl;
        });
        
        return globalExisting || null;
    } catch (error) {
        console.error('Error finding existing article:', error);
        return null;
    }
}

// Highlight existing article in the grid
function highlightExistingArticle(existingArticle) {
    // Find the article card in the DOM and highlight it
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach(card => {
        const titleElement = card.querySelector('.article-title');
        if (titleElement && titleElement.textContent === existingArticle.title) {
            // Add highlight effect
            card.style.border = '3px solid #dc2626';
            card.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.3)';
            card.style.transform = 'scale(1.02)';
            
            // Scroll to the highlighted article
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                card.style.border = '';
                card.style.boxShadow = '';
                card.style.transform = '';
            }, 5000);
        }
    });
}

// Find and remove duplicate articles
function findAndRemoveDuplicates() {
    try {
        const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
        const duplicates = [];
        const uniqueArticles = [];
        const seenUrls = new Set();
        const seenTitles = new Set();
        
        // First pass: identify duplicates by URL
        allArticles.forEach((article, index) => {
            const normalizedUrl = normalizeUrl(article.url);
            const normalizedTitle = article.title.toLowerCase().trim();
            
            if (seenUrls.has(normalizedUrl)) {
                // This is a URL duplicate
                duplicates.push({
                    article: article,
                    index: index,
                    type: 'URL',
                    reason: `Duplicate URL: ${article.url}`
                });
            } else if (seenTitles.has(normalizedTitle)) {
                // This is a title duplicate (same title, different URL)
                duplicates.push({
                    article: article,
                    index: index,
                    type: 'Title',
                    reason: `Duplicate Title: "${article.title}"`
                });
            } else {
                // This is unique
                uniqueArticles.push(article);
                seenUrls.add(normalizedUrl);
                seenTitles.add(normalizedTitle);
            }
        });
        
        if (duplicates.length === 0) {
            showMessage('No duplicate articles found!', 'success');
            return;
        }
        
        // Show duplicate removal interface
        showDuplicateRemovalInterface(duplicates, uniqueArticles);
        
    } catch (error) {
        console.error('Error finding duplicates:', error);
        showMessage('Error finding duplicate articles.', 'error');
    }
}

// Show duplicate removal interface
function showDuplicateRemovalInterface(duplicates, uniqueArticles) {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    let duplicateHTML = `
        <div class="duplicate-removal-interface" style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #dc2626; margin-bottom: 1rem;">🔍 Found ${duplicates.length} Duplicate Articles</h3>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">
                The following articles have been identified as duplicates. Choose which ones to remove:
            </p>
            
            <div style="margin-bottom: 1.5rem;">
                <button onclick="removeAllDuplicates(${JSON.stringify(duplicates).replace(/"/g, '&quot;')}, ${JSON.stringify(uniqueArticles).replace(/"/g, '&quot;')})" 
                        style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; margin-right: 1rem; cursor: pointer;">
                    🗑️ Remove All Duplicates (${duplicates.length})
                </button>
                <button onclick="closeDuplicateInterface()" 
                        style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    ❌ Cancel
                </button>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
    `;
    
    duplicates.forEach((duplicate, index) => {
        const badgeColor = duplicate.type === 'URL' ? '#dc2626' : '#f59e0b';
        const badgeText = duplicate.type === 'URL' ? 'URL Duplicate' : 'Title Duplicate';
        
        duplicateHTML += `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <strong style="color: #1f2937; font-size: 1.1rem;">${duplicate.article.title}</strong>
                    <span style="background: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                        ${badgeText}
                    </span>
                </div>
                <div style="color: #6b7280; margin-bottom: 0.5rem;">${duplicate.article.url}</div>
                <div style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    Added by: ${duplicate.article.addedBy || 'Unknown'} | Date: ${new Date(duplicate.article.addedAt).toLocaleDateString()}
                </div>
                <div style="color: #dc2626; font-size: 0.875rem; font-weight: 600;">${duplicate.reason}</div>
                <button onclick="removeSingleDuplicate(${index}, ${JSON.stringify(duplicates).replace(/"/g, '&quot;')}, ${JSON.stringify(uniqueArticles).replace(/"/g, '&quot;')})" 
                        style="background: #dc2626; color: white; padding: 6px 12px; border: none; border-radius: 4px; font-size: 0.875rem; margin-top: 0.5rem; cursor: pointer;">
                    Remove This Duplicate
                </button>
            </div>
        `;
    });
    
    duplicateHTML += `
            </div>
        </div>
    `;
    
    messageContainer.innerHTML = duplicateHTML;
}

// Remove all duplicates
function removeAllDuplicates(duplicates, uniqueArticles) {
    if (confirm(`Are you sure you want to remove all ${duplicates.length} duplicate articles? This action cannot be undone.`)) {
        try {
            // Save only unique articles
            localStorage.setItem('articles', JSON.stringify(uniqueArticles));
            
            // Update local array
            userArticles.length = 0;
            userArticles.push(...uniqueArticles);
            
            // Refresh display
            displayUserArticles();
            displayCommunityFavorites();
            
            // Close interface
            closeDuplicateInterface();
            
            showMessage(`Successfully removed ${duplicates.length} duplicate articles!`, 'success');
        } catch (error) {
            console.error('Error removing duplicates:', error);
            showMessage('Error removing duplicate articles.', 'error');
        }
    }
}

// Remove single duplicate
function removeSingleDuplicate(duplicateIndex, duplicates, uniqueArticles) {
    const duplicate = duplicates[duplicateIndex];
    
    if (confirm(`Are you sure you want to remove this duplicate article: "${duplicate.article.title}"?`)) {
        try {
            // Add the duplicate to unique articles (since we're removing it from duplicates)
            uniqueArticles.push(duplicate.article);
            
            // Remove from duplicates array
            duplicates.splice(duplicateIndex, 1);
            
            if (duplicates.length === 0) {
                // No more duplicates, save and close
                localStorage.setItem('articles', JSON.stringify(uniqueArticles));
                userArticles.length = 0;
                userArticles.push(...uniqueArticles);
                displayUserArticles();
                displayCommunityFavorites();
                closeDuplicateInterface();
                showMessage('All duplicate articles have been removed!', 'success');
            } else {
                // Update interface with remaining duplicates
                showDuplicateRemovalInterface(duplicates, uniqueArticles);
                showMessage(`Removed 1 duplicate article. ${duplicates.length} remaining.`, 'success');
            }
        } catch (error) {
            console.error('Error removing single duplicate:', error);
            showMessage('Error removing duplicate article.', 'error');
        }
    }
}

// Close duplicate removal interface
function closeDuplicateInterface() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
}

// Get article statistics (simplified)
function getDuplicateStats() {
    try {
        const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
        
        // Calculate simplified statistics
        let articlesShared = 0;
        let maxTicker = 0;
        
        allArticles.forEach(article => {
            const ticker = article.ticker || 1;
            
            // Count articles shared by multiple users (ticker > 1)
            if (ticker > 1) articlesShared++;
            
            // Track most shared article
            if (ticker > maxTicker) maxTicker = ticker;
        });
        
        return {
            totalArticles: allArticles.length,
            articlesShared: articlesShared,
            maxTicker: maxTicker
        };
    } catch (error) {
        console.error('Error getting article stats:', error);
        return null;
    }
}

// Reset ticker stats function
function resetTickerStats() {
    // Check if current user is a moderator
    if (!isCurrentUserModerator()) {
        showMessage('Only moderators can reset ticker stats.', 'error');
        return;
    }
    
    // Confirm the action with the user
    if (!confirm('Are you sure you want to reset all ticker stats? This will set all article ticker counts back to 1. This action cannot be undone.')) {
        return;
    }
    
    try {
        const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
        
        if (allArticles.length === 0) {
            showMessage('No articles found to reset.', 'info');
            return;
        }
        
        // Reset all ticker counts to 1
        const resetArticles = allArticles.map(article => ({
            ...article,
            ticker: 1
        }));
        
        // Save the reset articles back to localStorage
        localStorage.setItem('articles', JSON.stringify(resetArticles));
        
        // Update the local array
        userArticles.length = 0;
        userArticles.push(...resetArticles);
        
        // Refresh the display
        displayUserArticles();
        displayCommunityFavorites();
        
        showMessage(`Successfully reset ticker stats for ${allArticles.length} articles. All articles now have ticker count of 1.`, 'success');
        
        console.log(`Reset ticker stats: ${allArticles.length} articles reset to ticker = 1`);
        
    } catch (error) {
        console.error('Error resetting ticker stats:', error);
        showMessage('Error resetting ticker stats. Please try again.', 'error');
    }
}

// Check if current user is a moderator
function isCurrentUserModerator() {
    return currentUser && currentUser.role === 'Moderator';
}

// Show article statistics (moderators only)
function showDuplicateStats() {
    // Check if user is logged in and is a moderator
    if (!currentUser) {
        showMessage('Please log in to view article statistics.', 'error');
        return;
    }
    
    if (!isCurrentUserModerator()) {
        showMessage('Only moderators can view article statistics.', 'error');
        return;
    }
    
    const stats = getDuplicateStats();
    if (!stats) {
        showMessage('Error getting article statistics.', 'error');
        return;
    }
    
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    const statsHTML = `
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0ea5e9; margin-bottom: 1rem;">📊 Article Statistics (Moderator View)</h3>
            <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; font-style: italic;">
                Simplified statistics showing only the essential metrics.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: #0ea5e9;">${stats.totalArticles}</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">Total Articles</div>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: #10b981;">${stats.articlesShared}</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">Articles Shared</div>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: #ef4444;">${stats.maxTicker}</div>
                    <div style="color: #6b7280; font-size: 0.875rem;">Most Shared Article</div>
                </div>
            </div>
            <div style="text-align: center;">
                <p style="color: #10b981; font-weight: 600; margin-bottom: 1rem;">
                    ✨ Articles shared by multiple users are counted as "Articles Shared"
                </p>
                <button onclick="closeDuplicateInterface()" 
                        style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    ❌ Close
                </button>
            </div>
        </div>
    `;
    
    messageContainer.innerHTML = statsHTML;
}

// Real-time URL validation
function setupUrlValidation() {
    const urlInput = document.getElementById('url1');
    if (urlInput) {
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            const validationMessage = document.getElementById('urlValidationMessage');
            
            if (!validationMessage) {
                // Create validation message element if it doesn't exist
                const messageDiv = document.createElement('div');
                messageDiv.id = 'urlValidationMessage';
                messageDiv.style.marginTop = '8px';
                messageDiv.style.fontSize = '0.875rem';
                urlInput.parentNode.appendChild(messageDiv);
            }
            
            if (url && /^https?:\/\/.+/.test(url)) {
                if (isUrlAlreadyAdded(url)) {
                    const existingArticle = findExistingArticle(url);
                    validationMessage.textContent = `⚠️ This URL has already been added: "${existingArticle?.title || 'Unknown article'}"`;
                    validationMessage.style.color = '#dc2626';
                    validationMessage.style.fontWeight = '600';
                } else {
                    validationMessage.textContent = '✅ URL is available and ready to analyze';
                    validationMessage.style.color = '#10b981';
                    validationMessage.style.fontWeight = '600';
                }
            } else if (url) {
                validationMessage.textContent = '⚠️ Please enter a valid URL starting with http:// or https://';
                validationMessage.style.color = '#f59e0b';
                validationMessage.style.fontWeight = '600';
            } else {
                validationMessage.textContent = '';
            }
        });
    }
}

// Form handling
if (urlForm) {
    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if user is logged in
        if (!currentUser) {
            showMessage('Please log in to add articles.', 'error');
            return;
        }
        
        const url = document.getElementById('url1')?.value.trim();
        if (!url) {
            showMessage('Please enter a URL to analyze.', 'error');
            return;
        }
        
        if (!/^https?:\/\/.+/.test(url)) {
            showMessage('Please enter a valid URL starting with http:// or https://', 'error');
            return;
        }
        
        // Check if URL already exists
        if (isUrlAlreadyAdded(url)) {
            const existingArticle = findExistingArticle(url);
            if (existingArticle) {
                // Check if the current user is the same as the user who originally added the article
                if (existingArticle.userId === currentUser.id) {
                    // Same user trying to add the same article - reject as duplicate
                    showMessage('You have already shared this article. Duplicate submissions are not allowed.', 'error');
                    document.getElementById('url1').value = '';
                    return;
                } else {
                    // Different user adding the same article - increment ticker
                    existingArticle.ticker = (existingArticle.ticker || 1) + 1;
                    
                    // Update the article in storage
                    const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
                    const articleIndex = allArticles.findIndex(article => 
                        normalizeUrl(article.url) === normalizeUrl(existingArticle.url)
                    );
                    
                    if (articleIndex !== -1) {
                        allArticles[articleIndex] = existingArticle;
                        localStorage.setItem('articles', JSON.stringify(allArticles));
                        
                        // Update local array and display
                        userArticles.length = 0;
                        userArticles.push(...allArticles);
                        displayUserArticles();
                        displayCommunityFavorites();
                        
                        showMessage(`Article ticker incremented! This article has been shared ${existingArticle.ticker} times by multiple users.`);
                        document.getElementById('url1').value = '';
                    }
                }
            }
            return;
        }
        
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';
        }
        showLoading();
        
        try {
            const articleData = await extractArticleData(url);
            // Add user information to the article
            articleData.addedBy = currentUser.name;
            articleData.userId = currentUser.id;
            articleData.addedAt = new Date().toISOString();
            
            // Show the generated abstract
            const abstractPreviewText = document.getElementById('abstractPreviewText');
            if (abstractPreviewText) {
                abstractPreviewText.textContent = articleData.summary;
                abstractPreviewText.className = '';
            }
            
            // Save to global articles storage (visible to everyone)
            const allArticles = JSON.parse(localStorage.getItem('articles')) || [];
            allArticles.push(articleData);
            
            // Automatically clean duplicates after adding new article
            const cleanedArticles = autoCleanDuplicates(allArticles);
            localStorage.setItem('articles', JSON.stringify(cleanedArticles));
            
            // Update local array and display
            userArticles.length = 0;
            userArticles.push(...cleanedArticles);
            displayUserArticles();
            displayCommunityFavorites();
            hideLoading();
            showMessage('Successfully analyzed URL and added article!');
            document.getElementById('url1').value = '';
        } catch (error) {
            hideLoading();
            if (error.message === 'can not read URL') {
                showMessage('can not read URL', 'error');
            } else {
                showMessage('An error occurred while analyzing the URL. Please try again.', 'error');
            }
            console.error('Analysis error:', error);
        } finally {
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Analyze Article';
            }
        }
    });
}

// Authentication functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
                    // Verify moderator status - only Mendel can be a moderator
        if (currentUser.role === 'Moderator' && currentUser.email !== 'mendel@bmecom.com') {
            // Remove moderator role from non-Mendel users
            currentUser.role = 'User';
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update user in users array
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].role = 'User';
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
            
            updateUIForLoggedInUser();
        } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    if (urlInputSection) urlInputSection.style.display = 'block';
    if (loginRequiredSection) loginRequiredSection.style.display = 'none';
    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline-block';
    if (userInfo) {
        userInfo.style.display = 'block';
        if (userName && currentUser) {
            userName.textContent = currentUser.name;
        }
        
        // Add statistics button for moderators
        const existingStatsButton = userInfo.querySelector('.stats-button');
        if (isCurrentUserModerator()) {
            if (!existingStatsButton) {
                const statsButton = document.createElement('button');
                statsButton.className = 'stats-button';
                statsButton.onclick = showDuplicateStats;
                statsButton.style.cssText = 'background: #0ea5e9; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; margin-top: 0.5rem; cursor: pointer;';
                statsButton.textContent = '📊 Show Statistics';
                userInfo.appendChild(statsButton);
            }
        } else {
            // Remove statistics button for non-moderators
            if (existingStatsButton) {
                existingStatsButton.remove();
            }
        }
    }
    
    // Show moderator access for Mendel
    if (moderatorLink && currentUser && currentUser.email === 'mendel@bmecom.com') {
        moderatorLink.style.display = 'inline-block';
    } else if (moderatorLink) {
        moderatorLink.style.display = 'none';
    }
    
    // Load all articles and start real-time updates
    loadAllArticles();
    startRealTimeUpdates();
}

function updateUIForLoggedOutUser() {
    if (urlInputSection) urlInputSection.style.display = 'none';
    if (loginRequiredSection) loginRequiredSection.style.display = 'block';
    if (loginLink) loginLink.style.display = 'inline-block';
    if (logoutLink) logoutLink.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    if (moderatorLink) moderatorLink.style.display = 'none';
    if (moderatorSection) moderatorSection.style.display = 'none';
    
    // Still load all articles for public access and start real-time updates
    loadAllArticles();
    startRealTimeUpdates();
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUIForLoggedOutUser();
    showMessage('You have been logged out successfully.');
}

// Moderator functionality
function searchModeratorUsers() {
    const searchTerm = userSearchInput.value.toLowerCase().trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.length === 0) {
        moderatorUsersList.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 2rem;">No users found in the system.</div>';
        return;
    }
    
    // Sort users by creation date (most recent first)
    const sortedUsers = users.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });
    
    // Filter users based on search term
    const filteredUsers = searchTerm ? 
        sortedUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm) ||
            (user.role || 'User').toLowerCase().includes(searchTerm)
        ) : sortedUsers;
    
    if (filteredUsers.length === 0) {
        moderatorUsersList.innerHTML = 
            `<div style="text-align: center; color: #6b7280; padding: 2rem;">No users found matching "${searchTerm}".</div>`;
        return;
    }
    
    let usersListHTML = '<div style="margin-bottom: 1rem; font-weight: 600; color: #1f2937;">Users (Most Recent First):</div>';
    filteredUsers.forEach((user, index) => {
        const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
        const roleBadge = user.role === 'Moderator' ? 
            '<span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">Moderator</span>' : 
            '<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">User</span>';
        
                    const actionButton = user.role === 'Moderator' && user.email !== 'mendel@bmecom.com' ? 
            `<button class="analyze-btn" style="margin-top: 8px; padding: 6px 12px; font-size: 0.875rem;" 
                     onclick="removeModeratorRole('${user.id}')">Remove Moderator Role</button>` :
            user.role !== 'Moderator' ? 
            `<button class="analyze-btn" style="margin-top: 8px; padding: 6px 12px; font-size: 0.875rem;" 
                     onclick="addModeratorRole('${user.id}')">Make Moderator</button>` : '';
        
        usersListHTML += `
            <div style="margin: 10px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="font-size: 1.1rem;">${user.name}</strong>
                    ${roleBadge}
                </div>
                <div style="color: #6b7280; margin-bottom: 5px;">${user.email}</div>
                <div style="color: #9ca3af; font-size: 0.875rem;">Created: ${createdDate}</div>
                ${actionButton}
            </div>
        `;
    });
    
    moderatorUsersList.innerHTML = usersListHTML;
}

function addModeratorRole(userId) {
    try {
        // Check if current user is Mendel
        if (!currentUser || currentUser.email !== 'mendel@bmecom.com') {
            showMessage('Only Mendel can designate moderators.', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            showMessage('User not found.', 'error');
            return;
        }
        
        if (confirm(`Are you sure you want to make ${users[userIndex].name} a moderator?`)) {
            users[userIndex].role = 'Moderator';
            localStorage.setItem('users', JSON.stringify(users));
            
            // Refresh the user list
            searchModeratorUsers();
            
            showMessage(`User ${users[userIndex].name} has been designated as a moderator.`, 'success');
        }
        
    } catch (error) {
        showMessage('Error adding moderator role: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

function removeModeratorRole(userId) {
    try {
        // Check if current user is Mendel
        if (!currentUser || currentUser.email !== 'mendel@bmecom.com') {
            showMessage('Only Mendel can remove moderator roles.', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            showMessage('User not found.', 'error');
            return;
        }
        
        if (users[userIndex].email === 'mendel@bmecom.com') {
            showMessage('Cannot remove moderator role from Mendel.', 'error');
            return;
        }
        
        if (confirm(`Are you sure you want to remove moderator role from ${users[userIndex].name}?`)) {
            users[userIndex].role = 'User';
            localStorage.setItem('users', JSON.stringify(users));
            
            // Refresh the user list
            searchModeratorUsers();
            
            showMessage(`Moderator role removed from ${users[userIndex].name}.`, 'success');
        }
        
    } catch (error) {
        showMessage('Error removing moderator role: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

function toggleModeratorSection() {
    if (moderatorSection.style.display === 'none') {
        // Show moderator section
        moderatorSection.style.display = 'block';
        // Hide other sections
        document.querySelector('.community-favorites-section').style.display = 'none';
        document.querySelector('.all-articles-section').style.display = 'none';
        document.querySelector('.pending-articles-section').style.display = 'none'; // Hide pending articles by default
        // Load users
        searchModeratorUsers();
    } else {
        // Hide moderator section
        moderatorSection.style.display = 'none';
        // Show other sections
        document.querySelector('.community-favorites-section').style.display = 'block';
        document.querySelector('.all-articles-section').style.display = 'block';
        document.querySelector('.pending-articles-section').style.display = 'block'; // Show pending articles
    }
}

// Logout event listener
if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status first
    checkAuthStatus();
    
    // Load all articles from global storage and auto-clean duplicates
    const savedArticles = localStorage.getItem('articles');
    if (savedArticles) {
        try {
            const parsedArticles = JSON.parse(savedArticles);
            const cleanedArticles = autoCleanDuplicates(parsedArticles);
            
            // If duplicates were found and removed, save the cleaned version
            if (cleanedArticles.length < parsedArticles.length) {
                localStorage.setItem('articles', JSON.stringify(cleanedArticles));
                showMessage(`🧹 Cleaned up ${parsedArticles.length - cleanedArticles.length} duplicate articles on page load.`, 'success');
            }
            
            userArticles.push(...cleanedArticles);
        } catch (error) {
            console.error('Error loading saved articles:', error);
        }
    }
    
    // Update existing articles to fit new format
    const wasUpdated = updateExistingArticles();
    
    // Update like/dislike counts for all articles
    updateArticleLikeCounts();
    
    // Start real-time updates for everyone
    startRealTimeUpdates();
    
    // Setup URL validation
    setupUrlValidation();
    
    // Show message if articles were updated
    if (wasUpdated) {
        showMessage('Existing articles have been updated to meet new format requirements!');
    }
    
    // Moderator link event listener
    if (moderatorLink) {
        moderatorLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleModeratorSection();
        });
    }
    
    // User search input event listener
    if (userSearchInput) {
        userSearchInput.addEventListener('input', searchModeratorUsers);
    }
    
    // Sort select event listener
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            displayUserArticles();
        });
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Cleanup real-time updates when page is unloaded
window.addEventListener('beforeunload', () => {
    stopRealTimeUpdates();
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

// Like/Dislike functions
function likeArticle(articleIndex) {
    if (!currentUser) {
        showMessage('Please log in to like articles.', 'error');
        return;
    }
    
    const article = userArticles[articleIndex];
    if (!article) return;
    
    const articleId = article.url; // Use URL as unique identifier
    
    // Remove from dislikes if previously disliked
    if (userDislikes[articleId] && userDislikes[articleId].includes(currentUser.id)) {
        userDislikes[articleId] = userDislikes[articleId].filter(id => id !== currentUser.id);
        if (userDislikes[articleId].length === 0) {
            delete userDislikes[articleId];
        }
        localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    }
    
    // Toggle like
    if (!userLikes[articleId]) {
        userLikes[articleId] = [];
    }
    
    const userIndex = userLikes[articleId].indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add like
        userLikes[articleId].push(currentUser.id);
        showMessage('Article liked!', 'success');
    } else {
        // Remove like
        userLikes[articleId].splice(userIndex, 1);
        if (userLikes[articleId].length === 0) {
            delete userLikes[articleId];
        }
        showMessage('Like removed.', 'info');
    }
    
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
    
    // Update article like/dislike counts
    updateArticleLikeCounts();
    
    // Refresh display to show updated counts
    displayUserArticles();
    displayCommunityFavorites();
}

function dislikeArticle(articleIndex) {
    if (!currentUser) {
        showMessage('Please log in to dislike articles.', 'error');
        return;
    }
    
    const article = userArticles[articleIndex];
    if (!article) return;
    
    const articleId = article.url; // Use URL as unique identifier
    
    // Remove from likes if previously liked
    if (userLikes[articleId] && userLikes[articleId].includes(currentUser.id)) {
        userLikes[articleId] = userLikes[articleId].filter(id => id !== currentUser.id);
        if (userLikes[articleId].length === 0) {
            delete userLikes[articleId];
        }
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
    }
    
    // Toggle dislike
    if (!userDislikes[articleId]) {
        userDislikes[articleId] = [];
    }
    
    const userIndex = userDislikes[articleId].indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add dislike
        userDislikes[articleId].push(currentUser.id);
        showMessage('Article disliked.', 'info');
    } else {
        // Remove dislike
        userDislikes[articleId].splice(userIndex, 1);
        if (userDislikes[articleId].length === 0) {
            delete userDislikes[articleId];
        }
        showMessage('Dislike removed.', 'info');
    }
    
    localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    
    // Update article like/dislike counts
    updateArticleLikeCounts();
    
    // Refresh display to show updated counts
    displayUserArticles();
    displayCommunityFavorites();
}

function updateArticleLikeCounts() {
    // Update all articles with like/dislike counts
    userArticles.forEach(article => {
        const articleId = article.url;
        article.likes = userLikes[articleId] ? userLikes[articleId].length : 0;
        article.dislikes = userDislikes[articleId] ? userDislikes[articleId].length : 0;
    });
    
    // Save updated articles to localStorage
    localStorage.setItem('articles', JSON.stringify(userArticles));
}

function isArticleLikedByUser(articleUrl) {
    if (!currentUser) return false;
    return userLikes[articleUrl] && userLikes[articleUrl].includes(currentUser.id);
}

function isArticleDislikedByUser(articleUrl) {
    if (!currentUser) return false;
    return userDislikes[articleUrl] && userDislikes[articleUrl].includes(currentUser.id);
}

// Comment Functions
function containsCurseWords(text) {
    const lowerText = text.toLowerCase();
    return curseWords.some(word => lowerText.includes(word));
}

function addComment(articleIndex, commentText, parentCommentId = null) {
    if (!currentUser) {
        showMessage('Please log in to add comments. You must be logged in to write comments.', 'error');
        return;
    }
    
    if (!commentText.trim()) {
        showMessage('Please enter a comment.', 'error');
        return;
    }
    
    if (containsCurseWords(commentText)) {
        showMessage('Your comment contains inappropriate language and cannot be posted.', 'error');
        return;
    }
    
    const article = userArticles[articleIndex];
    if (!article) return;
    
    const articleId = article.url;
    
    if (!articleComments[articleId]) {
        articleComments[articleId] = [];
    }
    
    const newComment = {
        id: Date.now() + Math.random(),
        text: commentText.trim(),
        author: currentUser.name,
        authorId: currentUser.id,
        timestamp: new Date().toISOString(),
        parentId: parentCommentId,
        replies: [],
        likes: 0,
        dislikes: 0
    };
    
    if (parentCommentId) {
        // This is a reply
        const parentComment = findCommentById(articleComments[articleId], parentCommentId);
        if (parentComment) {
            parentComment.replies.push(newComment);
        }
    } else {
        // This is a top-level comment
        articleComments[articleId].push(newComment);
    }
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    showMessage('Comment added successfully!', 'success');
    
    // Refresh the comments display
    displayComments(articleIndex);
}

function findCommentById(comments, commentId) {
    for (let comment of comments) {
        if (comment.id === commentId) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentById(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
}

function deleteComment(articleIndex, commentId) {
    if (!currentUser) return;
    
    const article = userArticles[articleIndex];
    if (!article) return;
    
    const articleId = article.url;
    if (!articleComments[articleId]) return;
    
    const comment = findCommentById(articleComments[articleId], commentId);
    if (!comment) return;
    
    // Only allow deletion if user is the author or a moderator
    if (comment.authorId !== currentUser.id && !isCurrentUserModerator()) {
        showMessage('You can only delete your own comments.', 'error');
        return;
    }
    
    // Remove comment from the array
    removeCommentFromArray(articleComments[articleId], commentId);
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    showMessage('Comment deleted successfully.', 'success');
    
    // Refresh the comments display
    displayComments(articleIndex);
}

function removeCommentFromArray(comments, commentId) {
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            comments.splice(i, 1);
            return true;
        }
        if (comments[i].replies && comments[i].replies.length > 0) {
            if (removeCommentFromArray(comments[i].replies, commentId)) {
                return true;
            }
        }
    }
    return false;
}

function likeComment(articleIndex, commentId) {
    if (!currentUser) {
        showMessage('Please log in to like comments.', 'error');
        return;
    }
    
    const comment = findCommentById(articleComments[userArticles[articleIndex].url], commentId);
    if (!comment) return;
    
    if (!comment.userLikes) comment.userLikes = [];
    if (!comment.userDislikes) comment.userDislikes = [];
    
    const userIndex = comment.userLikes.indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add like
        comment.userLikes.push(currentUser.id);
        comment.likes++;
        
        // Remove dislike if exists
        const dislikeIndex = comment.userDislikes.indexOf(currentUser.id);
        if (dislikeIndex !== -1) {
            comment.userDislikes.splice(dislikeIndex, 1);
            comment.dislikes--;
        }
    } else {
        // Remove like
        comment.userLikes.splice(userIndex, 1);
        comment.likes--;
    }
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    displayComments(articleIndex);
}

function dislikeComment(articleIndex, commentId) {
    if (!currentUser) {
        showMessage('Please log in to dislike comments.', 'error');
        return;
    }
    
    const comment = findCommentById(articleComments[userArticles[articleIndex].url], commentId);
    if (!comment) return;
    
    if (!comment.userLikes) comment.userLikes = [];
    if (!comment.userDislikes) comment.userDislikes = [];
    
    const userIndex = comment.userDislikes.indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add dislike
        comment.userDislikes.push(currentUser.id);
        comment.dislikes++;
        
        // Remove like if exists
        const likeIndex = comment.userLikes.indexOf(currentUser.id);
        if (likeIndex !== -1) {
            comment.userLikes.splice(likeIndex, 1);
            comment.likes--;
        }
    } else {
        // Remove dislike
        comment.userDislikes.splice(userIndex, 1);
        comment.dislikes--;
    }
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    displayComments(articleIndex);
}

function displayComments(articleIndex) {
    const article = userArticles[articleIndex];
    if (!article) return;
    
    const articleId = article.url;
    const commentsContainer = document.getElementById(`comments-${articleIndex}`);
    if (!commentsContainer) return;
    
    const comments = articleComments[articleId] || [];
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
        return;
    }
    
    let commentsHTML = '';
    
    comments.forEach(comment => {
        commentsHTML += createCommentHTML(comment, articleIndex, 0);
    });
    
    commentsContainer.innerHTML = commentsHTML;
}

function createCommentHTML(comment, articleIndex, depth = 0) {
    const isAuthor = currentUser && comment.authorId === currentUser.id;
    const isModerator = isCurrentUserModerator();
    const canDelete = isAuthor || isModerator;
    const isLiked = currentUser && comment.userLikes && comment.userLikes.includes(currentUser.id);
    const isDisliked = currentUser && comment.userDislikes && comment.userDislikes.includes(currentUser.id);
    
    const timeAgo = getTimeAgo(new Date(comment.timestamp));
    const indentStyle = depth > 0 ? `margin-left: ${depth * 20}px;` : '';
    
    let commentHTML = `
        <div class="comment" style="${indentStyle}">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${timeAgo}</span>
                ${canDelete ? `<button onclick="deleteComment(${articleIndex}, ${comment.id})" class="delete-comment-btn">🗑️</button>` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-actions">
                <button onclick="likeComment(${articleIndex}, ${comment.id})" class="comment-like-btn ${isLiked ? 'liked' : ''}">
                    👍 <span class="comment-like-count">${comment.likes || 0}</span>
                </button>
                <button onclick="dislikeComment(${articleIndex}, ${comment.id})" class="comment-dislike-btn ${isDisliked ? 'disliked' : ''}">
                    👎 <span class="comment-dislike-count">${comment.dislikes || 0}</span>
                </button>
                <button onclick="showReplyForm(${articleIndex}, ${comment.id})" class="reply-btn">💬 Reply</button>
            </div>
            <div id="reply-form-${comment.id}" class="reply-form" style="display: none;">
                <textarea placeholder="Write your reply..." class="reply-textarea"></textarea>
                <div class="reply-actions">
                    <button onclick="submitReply(${articleIndex}, ${comment.id})" class="submit-reply-btn">Submit Reply</button>
                    <button onclick="hideReplyForm(${comment.id})" class="cancel-reply-btn">Cancel</button>
                </div>
            </div>
    `;
    
    // Add replies
    if (comment.replies && comment.replies.length > 0) {
        commentHTML += '<div class="comment-replies">';
        comment.replies.forEach(reply => {
            commentHTML += createCommentHTML(reply, articleIndex, depth + 1);
        });
        commentHTML += '</div>';
    }
    
    commentHTML += '</div>';
    return commentHTML;
}

function showReplyForm(articleIndex, commentId) {
    if (!currentUser) {
        showMessage('Please log in to reply to comments.', 'error');
        return;
    }
    
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'block';
        replyForm.querySelector('.reply-textarea').focus();
    }
}

function hideReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'none';
        replyForm.querySelector('.reply-textarea').value = '';
    }
}

function submitReply(articleIndex, commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (!replyForm) return;
    
    const textarea = replyForm.querySelector('.reply-textarea');
    const replyText = textarea.value.trim();
    
    if (!replyText) {
        showMessage('Please enter a reply.', 'error');
        return;
    }
    
    addComment(articleIndex, replyText, commentId);
    hideReplyForm(commentId);
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to find the most liked comment for an article
function getMostLikedComment(articleUrl) {
    const comments = articleComments[articleUrl] || [];
    if (comments.length === 0) return null;
    
    let mostLikedComment = null;
    let maxLikes = -1;
    let mostRecentTimestamp = 0;
    
    // Recursive function to check all comments and replies
    function checkComments(commentList) {
        commentList.forEach(comment => {
            const likes = comment.likes || 0;
            const timestamp = new Date(comment.timestamp).getTime();
            
            if (likes > maxLikes) {
                // New highest like count
                mostLikedComment = comment;
                maxLikes = likes;
                mostRecentTimestamp = timestamp;
            } else if (likes === maxLikes && likes > 0) {
                // Tie in likes, check timestamp (most recent wins)
                if (timestamp > mostRecentTimestamp) {
                    mostLikedComment = comment;
                    mostRecentTimestamp = timestamp;
                }
            }
            
            // Check replies recursively
            if (comment.replies && comment.replies.length > 0) {
                checkComments(comment.replies);
            }
        });
    }
    
    checkComments(comments);
    return mostLikedComment;
}

// Function to create HTML for the most liked comment preview
function createMostLikedCommentPreview(articleUrl, articleIndex) {
    const mostLikedComment = getMostLikedComment(articleUrl);
    
    if (!mostLikedComment) {
        return '';
    }
    
    const timeAgo = getTimeAgo(new Date(mostLikedComment.timestamp));
    const commentText = escapeHtml(mostLikedComment.text);
    const truncatedText = commentText.length > 150 ? commentText.substring(0, 150) + '...' : commentText;
    
            return `
            <div class="most-liked-comment">
                <div class="most-liked-header">
                    <span class="most-liked-label">🏆 Most Liked Comment</span>
                </div>
                <div class="most-liked-author">by ${mostLikedComment.author}</div>
                <div class="most-liked-text">${truncatedText}</div>
                <div class="most-liked-meta">
                    <span class="most-liked-time">${timeAgo}</span>
                </div>
            </div>
        `;
}

function showCommentsSection(articleIndex) {
    const article = userArticles[articleIndex];
    if (!article) return;
    
    const articleId = article.url;
    const commentsSection = document.getElementById(`comments-section-${articleIndex}`);
    if (!commentsSection) return;
    
    const isVisible = commentsSection.style.display !== 'none';
    
    if (isVisible) {
        commentsSection.style.display = 'none';
        // Update the "Show Comments" button text
        const showCommentsBtn = document.querySelector(`button[onclick="showCommentsSection(${articleIndex})"]`);
        if (showCommentsBtn && showCommentsBtn.classList.contains('show-comments-btn')) {
            const commentCount = articleComments[article.url] ? articleComments[article.url].length : 0;
            showCommentsBtn.textContent = `💬 Show Comments (${commentCount})`;
        }
    } else {
        commentsSection.style.display = 'block';
        displayComments(articleIndex);
        // Update the "Show Comments" button text to "Close Comments"
        const showCommentsBtn = document.querySelector(`button[onclick="showCommentsSection(${articleIndex})"]`);
        if (showCommentsBtn && showCommentsBtn.classList.contains('show-comments-btn')) {
            showCommentsBtn.textContent = '💬 Close Comments';
        }
    }
}