// BMECom Article Detail Page JavaScript

// DOM elements
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const articleDetailCard = document.getElementById('articleDetailCard');

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

// Get article URL from URL parameters
function getArticleUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('url');
}

// Load article data from localStorage by URL with multiple fallback strategies
function loadArticleData(articleUrl) {
    try {
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        console.log('Total articles in localStorage:', articles.length);
        console.log('Searching for URL:', articleUrl);
        
        if (!articleUrl) {
            console.log('No article URL provided');
            return null;
        }
        
        const normalizedSearchUrl = normalizeUrl(articleUrl);
        console.log('Normalized search URL:', normalizedSearchUrl);
        
        // Strategy 1: Exact normalized URL match
        let foundArticle = articles.find(article => {
            const normalizedArticleUrl = normalizeUrl(article.url);
            console.log('Comparing:', normalizedArticleUrl, 'with', normalizedSearchUrl);
            return normalizedArticleUrl === normalizedSearchUrl;
        });
        
        if (foundArticle) {
            console.log('Found article with exact match:', foundArticle.title);
            return foundArticle;
        }
        
        // Strategy 2: Partial URL match
        console.log('Exact match not found, trying partial match...');
        foundArticle = articles.find(article => {
            const normalizedArticleUrl = normalizeUrl(article.url);
            return normalizedArticleUrl.includes(normalizedSearchUrl) || 
                   normalizedSearchUrl.includes(normalizedArticleUrl);
        });
        
        if (foundArticle) {
            console.log('Found article with partial match:', foundArticle.title);
            return foundArticle;
        }
        
        // Strategy 3: Match by URL path segments
        console.log('Partial match not found, trying path segment match...');
        const urlParts = articleUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        
        if (lastPart) {
            foundArticle = articles.find(article => {
                const articleUrlParts = article.url.split('/');
                const articleLastPart = articleUrlParts[articleUrlParts.length - 1] || articleUrlParts[articleUrlParts.length - 2];
                return articleLastPart === lastPart;
            });
            
            if (foundArticle) {
                console.log('Found article with path segment match:', foundArticle.title);
                return foundArticle;
            }
        }
        
        // Strategy 4: Show all available articles for debugging
        console.log('No match found. Available articles:');
        articles.forEach((article, index) => {
            console.log(`${index}: ${article.title} - ${article.url}`);
        });
        
        console.log('Article not found');
        return null;
        
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
    
    const normalizedUrl = normalizeUrl(articleUrl);
    
    // Remove from dislikes if previously disliked
    if (userDislikes[normalizedUrl] && userDislikes[normalizedUrl].includes(currentUser.id)) {
        userDislikes[normalizedUrl] = userDislikes[normalizedUrl].filter(id => id !== currentUser.id);
        if (userDislikes[normalizedUrl].length === 0) {
            delete userDislikes[normalizedUrl];
        }
        localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    }
    
    // Toggle like
    if (!userLikes[normalizedUrl]) {
        userLikes[normalizedUrl] = [];
    }
    
    const userIndex = userLikes[normalizedUrl].indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add like
        userLikes[normalizedUrl].push(currentUser.id);
        showMessage('Article liked!', 'success');
    } else {
        // Remove like
        userLikes[normalizedUrl].splice(userIndex, 1);
        if (userLikes[normalizedUrl].length === 0) {
            delete userLikes[normalizedUrl];
        }
        showMessage('Like removed.', 'info');
    }
    
    localStorage.setItem('userLikes', JSON.stringify(userLikes));
    
    // Refresh the display
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
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
    
    const normalizedUrl = normalizeUrl(articleUrl);
    
    // Remove from likes if previously liked
    if (userLikes[normalizedUrl] && userLikes[normalizedUrl].includes(currentUser.id)) {
        userLikes[normalizedUrl] = userLikes[normalizedUrl].filter(id => id !== currentUser.id);
        if (userLikes[normalizedUrl].length === 0) {
            delete userLikes[normalizedUrl];
        }
        localStorage.setItem('userLikes', JSON.stringify(userLikes));
    }
    
    // Toggle dislike
    if (!userDislikes[normalizedUrl]) {
        userDislikes[normalizedUrl] = [];
    }
    
    const userIndex = userDislikes[normalizedUrl].indexOf(currentUser.id);
    if (userIndex === -1) {
        // Add dislike
        userDislikes[normalizedUrl].push(currentUser.id);
        showMessage('Article disliked.', 'info');
    } else {
        // Remove dislike
        userDislikes[normalizedUrl].splice(userIndex, 1);
        if (userDislikes[normalizedUrl].length === 0) {
            delete userDislikes[normalizedUrl];
        }
        showMessage('Dislike removed.', 'info');
    }
    
    localStorage.setItem('userDislikes', JSON.stringify(userDislikes));
    
    // Refresh the display
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
    if (article) {
        displayArticleDetail(article);
    }
}

function isArticleLikedByUser(articleUrl) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    const normalizedUrl = normalizeUrl(articleUrl);
    return userLikes[normalizedUrl] && userLikes[normalizedUrl].includes(currentUser.id);
}

function isArticleDislikedByUser(articleUrl) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    const normalizedUrl = normalizeUrl(articleUrl);
    return userDislikes[normalizedUrl] && userDislikes[normalizedUrl].includes(currentUser.id);
}

// Display article detail
function displayArticleDetail(article) {
    if (!article) {
        showError('Article not found');
        return;
    }

    console.log('Displaying article:', article.title);

    const imageDisplay = article.image ? 
        `<div class="article-image">
            <img src="${article.image}" alt="${article.title}" onerror="this.style.display='none'">
        </div>` : '';

    const categoryDisplay = article.category ? 
        `<div class="article-category">${article.category}</div>` : '';

    // Like/Dislike buttons
    const isLiked = isArticleLikedByUser(article.url);
    const isDisliked = isArticleDislikedByUser(article.url);
    const normalizedUrl = normalizeUrl(article.url);
    const likeCount = userLikes[normalizedUrl] ? userLikes[normalizedUrl].length : 0;
    const dislikeCount = userDislikes[normalizedUrl] ? userDislikes[normalizedUrl].length : 0;
    
    const likeButton = `
        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeArticle('${article.url}')" title="${isLiked ? 'Remove like' : 'Like article'}">
            <span class="like-icon">${isLiked ? '👍' : '👍'}</span>
            <span class="like-count">${likeCount}</span>
        </button>
    `;
    
    const dislikeButton = `
        <button class="dislike-btn ${isDisliked ? 'disliked' : ''}" onclick="dislikeArticle('${article.url}')" title="${isDisliked ? 'Remove dislike' : 'Dislike article'}">
            <span class="dislike-icon">${isDisliked ? '👎' : '👎'}</span>
            <span class="dislike-count">${dislikeCount}</span>
        </button>
    `;

    // Get comment count
    const commentCount = articleComments[normalizedUrl] ? articleComments[normalizedUrl].length : 0;
    
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
        
        <!-- Comments Section -->
        <div class="comments-section">
            <div class="comments-header">
                <h4>💬 Comments (${commentCount})</h4>
            </div>
            
            <!-- Add Comment Form -->
            <div class="add-comment-form">
                <textarea id="comment-text-detail" placeholder="Write a comment..." class="comment-textarea"></textarea>
                <button onclick="addCommentDetail(document.getElementById('comment-text-detail').value)" class="add-comment-btn">
                    Add Comment
                </button>
            </div>
            
            <!-- Comments Container -->
            <div id="comments-container" class="comments-container">
                <!-- Comments will be loaded here -->
            </div>
        </div>
    `;
    
    // Load comments after the HTML is set
    displayCommentsDetail();
    
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
    console.log('Showing error:', message);
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
    console.log('=== ARTICLE DETAIL PAGE LOADING ===');
    
    const articleUrl = getArticleUrl();
    console.log('Article URL from parameters:', articleUrl);
    
    if (articleUrl === null) {
        console.log('No article URL provided');
        showError('No article URL provided. Please go back and click "Read Full Abstract" on an article.');
        return;
    }
    
    // Load article data
    const article = loadArticleData(articleUrl);
    console.log('Loaded article data:', article);
    
    if (article) {
        console.log('Article found, displaying...');
        hideLoading();
        displayArticleDetail(article);
        articleDetailCard.style.display = 'block';
    } else {
        console.log('Article not found');
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        const errorMessage = articles.length > 0 
            ? `Article not found. Searched for: ${articleUrl}. Available articles: ${articles.length}. Please check the console for debugging information.`
            : 'No articles found in localStorage. Please add some articles first.';
        showError(errorMessage);
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

// Comment Functions for Article Detail Page
function containsCurseWords(text) {
    const lowerText = text.toLowerCase();
    return curseWords.some(word => lowerText.includes(word));
}

function addCommentDetail(commentText, parentCommentId = null) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to add comments.', 'error');
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
    
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
    if (!article) return;
    
    const normalizedUrl = normalizeUrl(articleUrl);
    if (!articleComments[normalizedUrl]) {
        articleComments[normalizedUrl] = [];
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
        const parentComment = findCommentByIdDetail(articleComments[normalizedUrl], parentCommentId);
        if (parentComment) {
            parentComment.replies.push(newComment);
        }
    } else {
        // This is a top-level comment
        articleComments[normalizedUrl].push(newComment);
    }
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    showMessage('Comment added successfully!', 'success');
    
    // Refresh the comments display
    displayCommentsDetail();
}

function findCommentByIdDetail(comments, commentId) {
    for (let comment of comments) {
        if (comment.id === commentId) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentByIdDetail(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
}

function deleteCommentDetail(commentId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
    if (!article) return;
    
    const normalizedUrl = normalizeUrl(articleUrl);
    if (!articleComments[normalizedUrl]) return;
    
    const comment = findCommentByIdDetail(articleComments[normalizedUrl], commentId);
    if (!comment) return;
    
    // Only allow deletion if user is the author or a moderator
    if (comment.authorId !== currentUser.id && currentUser.role !== 'Moderator') {
        showMessage('You can only delete your own comments.', 'error');
        return;
    }
    
    // Remove comment from the array
    removeCommentFromArrayDetail(articleComments[normalizedUrl], commentId);
    
    localStorage.setItem('articleComments', JSON.stringify(articleComments));
    showMessage('Comment deleted successfully.', 'success');
    
    // Refresh the comments display
    displayCommentsDetail();
}

function removeCommentFromArrayDetail(comments, commentId) {
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            comments.splice(i, 1);
            return true;
        }
        if (comments[i].replies && comments[i].replies.length > 0) {
            if (removeCommentFromArrayDetail(comments[i].replies, commentId)) {
                return true;
            }
        }
    }
    return false;
}

function likeCommentDetail(commentId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to like comments.', 'error');
        return;
    }
    
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
    if (!article) return;
    
    const normalizedUrl = normalizeUrl(articleUrl);
    const comment = findCommentByIdDetail(articleComments[normalizedUrl], commentId);
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
    displayCommentsDetail();
}

function dislikeCommentDetail(commentId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to dislike comments.', 'error');
        return;
    }
    
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
    if (!article) return;
    
    const normalizedUrl = normalizeUrl(articleUrl);
    const comment = findCommentByIdDetail(articleComments[normalizedUrl], commentId);
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
    displayCommentsDetail();
}

function displayCommentsDetail() {
    const articleUrl = getArticleUrl();
    const article = loadArticleData(articleUrl);
    if (!article) return;
    
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    const normalizedUrl = normalizeUrl(articleUrl);
    const comments = articleComments[normalizedUrl] || [];
    
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
        commentsHTML += createCommentHTMLDetail(comment, 0);
    });
    
    commentsContainer.innerHTML = commentsHTML;
}

function createCommentHTMLDetail(comment, depth = 0) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAuthor = currentUser && comment.authorId === currentUser.id;
    const isModerator = currentUser && currentUser.role === 'Moderator';
    const canDelete = isAuthor || isModerator;
    const isLiked = currentUser && comment.userLikes && comment.userLikes.includes(currentUser.id);
    const isDisliked = currentUser && comment.userDislikes && comment.userDislikes.includes(currentUser.id);
    
    const timeAgo = getTimeAgoDetail(new Date(comment.timestamp));
    const indentStyle = depth > 0 ? `margin-left: ${depth * 20}px;` : '';
    
    let commentHTML = `
        <div class="comment" style="${indentStyle}">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${timeAgo}</span>
                ${canDelete ? `<button onclick="deleteCommentDetail(${comment.id})" class="delete-comment-btn">🗑️</button>` : ''}
            </div>
            <div class="comment-text">${escapeHtmlDetail(comment.text)}</div>
            <div class="comment-actions">
                <button onclick="likeCommentDetail(${comment.id})" class="comment-like-btn ${isLiked ? 'liked' : ''}">
                    👍 <span class="comment-like-count">${comment.likes || 0}</span>
                </button>
                <button onclick="dislikeCommentDetail(${comment.id})" class="comment-dislike-btn ${isDisliked ? 'disliked' : ''}">
                    👎 <span class="comment-dislike-count">${comment.dislikes || 0}</span>
                </button>
                <button onclick="showReplyFormDetail(${comment.id})" class="reply-btn">💬 Reply</button>
            </div>
            <div id="reply-form-detail-${comment.id}" class="reply-form" style="display: none;">
                <textarea placeholder="Write your reply..." class="reply-textarea"></textarea>
                <div class="reply-actions">
                    <button onclick="submitReplyDetail(${comment.id})" class="submit-reply-btn">Submit Reply</button>
                    <button onclick="hideReplyFormDetail(${comment.id})" class="cancel-reply-btn">Cancel</button>
                </div>
            </div>
    `;
    
    // Add replies
    if (comment.replies && comment.replies.length > 0) {
        commentHTML += '<div class="comment-replies">';
        comment.replies.forEach(reply => {
            commentHTML += createCommentHTMLDetail(reply, depth + 1);
        });
        commentHTML += '</div>';
    }
    
    commentHTML += '</div>';
    return commentHTML;
}

function showReplyFormDetail(commentId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to reply to comments.', 'error');
        return;
    }
    
    const replyForm = document.getElementById(`reply-form-detail-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'block';
        replyForm.querySelector('.reply-textarea').focus();
    }
}

function hideReplyFormDetail(commentId) {
    const replyForm = document.getElementById(`reply-form-detail-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'none';
        replyForm.querySelector('.reply-textarea').value = '';
    }
}

function submitReplyDetail(commentId) {
    const replyForm = document.getElementById(`reply-form-detail-${commentId}`);
    if (!replyForm) return;
    
    const textarea = replyForm.querySelector('.reply-textarea');
    const replyText = textarea.value.trim();
    
    if (!replyText) {
        showMessage('Please enter a reply.', 'error');
        return;
    }
    
    addCommentDetail(replyText, commentId);
    hideReplyFormDetail(commentId);
}

function getTimeAgoDetail(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

function escapeHtmlDetail(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
} 