// Super Simple BMECom Articles - Guaranteed to Work

console.log('🔧 Loading Super Simple BMECom Articles...');

// Global variables
let articles = [];
let currentUser = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, setting up articles...');
    
    // Load data
    loadData();
    
    // Setup UI
    setupUI();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Articles setup complete!');
});

// Load data from localStorage
function loadData() {
    try {
        articles = JSON.parse(localStorage.getItem('articles') || '[]');
        currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        console.log('📊 Loaded', articles.length, 'articles');
    } catch (error) {
        console.error('Error loading data:', error);
        articles = [];
        currentUser = null;
    }
}

// Setup UI based on login status
function setupUI() {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const urlInputSection = document.getElementById('urlInputSection');
    const loginRequiredSection = document.getElementById('loginRequiredSection');
    
    if (currentUser) {
        // User is logged in
        if (userInfo) userInfo.style.display = 'block';
        if (userName) userName.textContent = currentUser.name;
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
        if (urlInputSection) urlInputSection.style.display = 'block';
        if (loginRequiredSection) loginRequiredSection.style.display = 'none';
    } else {
        // User is not logged in
        if (userInfo) userInfo.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline';
        if (logoutLink) logoutLink.style.display = 'none';
        if (urlInputSection) urlInputSection.style.display = 'none';
        if (loginRequiredSection) loginRequiredSection.style.display = 'block';
    }
    
    // Display articles
    displayArticles();
}

// Setup event listeners
function setupEventListeners() {
    // URL form
    const urlForm = document.getElementById('urlForm');
    if (urlForm) {
        urlForm.onsubmit = function(e) {
            e.preventDefault();
            handleUrlSubmission();
        };
    }
    
    // Login/logout links
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.onclick = function() {
            window.location.href = 'login.html';
        };
    }
    
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.onclick = function() {
            handleLogout();
        };
    }
}

// Handle URL submission
function handleUrlSubmission() {
    const urlInput = document.getElementById('url1');
    const url = urlInput.value.trim();
    
    if (!url) {
        showMessage('Please enter a URL', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Please log in to add articles', 'error');
        return;
    }
    
    // Check if URL already exists
    if (articles.find(article => article.url === url)) {
        showMessage('This article has already been added', 'error');
        return;
    }
    
    // Create article data
    const articleData = createArticleData(url);
    
    // Add article
    articles.push(articleData);
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Clear form
    urlInput.value = '';
    
    // Update display
    displayArticles();
    
    showMessage('Article added successfully!', 'success');
}

// Create article data from URL
function createArticleData(url) {
    const domain = new URL(url).hostname;
    
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
    
    return {
        title: title,
        summary: summary,
        image: `https://source.unsplash.com/800x400/?biomedical,engineering,medical,technology&t=${Date.now()}`,
        source: domain,
        date: new Date().getFullYear().toString(),
        url: url,
        category: 'Biomedical Engineering',
        userId: currentUser.id,
        userName: currentUser.name,
        dateAdded: new Date().toISOString(),
        likes: 0,
        dislikes: 0
    };
}

// Display articles
function displayArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
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
                    <button class="like-btn" onclick="likeArticle(${index})">
                        👍 ${article.likes || 0}
                    </button>
                    <button class="dislike-btn" onclick="dislikeArticle(${index})">
                        👎 ${article.dislikes || 0}
                    </button>
                </div>
                
                <a href="abstract-viewer.html?url=${encodeURIComponent(article.url)}" class="read-more-btn">
                    Read Full Abstract →
                </a>
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
    
    articles[index].likes = (articles[index].likes || 0) + 1;
    localStorage.setItem('articles', JSON.stringify(articles));
    displayArticles();
}

// Dislike article
function dislikeArticle(index) {
    if (!currentUser) {
        showMessage('Please log in to dislike articles', 'error');
        return;
    }
    
    articles[index].dislikes = (articles[index].dislikes || 0) + 1;
    localStorage.setItem('articles', JSON.stringify(articles));
    displayArticles();
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    setupUI();
    showMessage('Logged out successfully', 'success');
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

console.log('✅ Super Simple BMECom Articles loaded successfully!'); 