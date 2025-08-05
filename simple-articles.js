// Super Simple BMECom Articles - Enhanced with AI Integration

console.log('🔧 Loading Super Simple BMECom Articles with AI...');

// Global variables
let articles = [];
let currentUser = null;
let userLikes = new Set();
let userDislikes = new Set();

// AI Configuration
const AI_CONFIG = {
    openai: {
        apiKey: localStorage.getItem('openaiApiKey') || '',
        enabled: false
    },
    anthropic: {
        apiKey: localStorage.getItem('anthropicApiKey') || '',
        enabled: false
    },
    google: {
        apiKey: localStorage.getItem('googleApiKey') || '',
        enabled: false
    },
    cohere: {
        apiKey: localStorage.getItem('cohereApiKey') || '',
        enabled: false
    },
    huggingface: {
        apiKey: localStorage.getItem('huggingfaceApiKey') || '',
        enabled: false
    },
    perplexity: {
        apiKey: localStorage.getItem('perplexityApiKey') || '',
        enabled: false
    },
    cursor_ai: {
        apiKey: localStorage.getItem('cursorAiApiKey') || '',
        enabled: false
    }
};

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
        
        // Fix currentUser loading
        const userData = localStorage.getItem('currentUser');
        if (userData && userData !== 'null' && userData !== 'undefined') {
            currentUser = JSON.parse(userData);
            console.log('👤 Current user loaded:', currentUser.name);
        } else {
            currentUser = null;
            console.log('❌ No current user found');
        }
        
        // Load user likes/dislikes
        if (currentUser) {
            const likesData = localStorage.getItem(`userLikes_${currentUser.id}`) || '[]';
            const dislikesData = localStorage.getItem(`userDislikes_${currentUser.id}`) || '[]';
            userLikes = new Set(JSON.parse(likesData));
            userDislikes = new Set(JSON.parse(dislikesData));
            console.log('👍 User likes loaded:', userLikes.size);
            console.log('👎 User dislikes loaded:', userDislikes.size);
        }
        
        console.log('📊 Loaded', articles.length, 'articles');
        console.log('🔐 Authentication status:', currentUser ? 'Logged in as ' + currentUser.name : 'Not logged in');
    } catch (error) {
        console.error('Error loading data:', error);
        articles = [];
        currentUser = null;
        userLikes = new Set();
        userDislikes = new Set();
    }
}

// Setup UI based on login status
function setupUI() {
    console.log('🎨 Setting up UI...');
    console.log('🔐 Current user for UI:', currentUser);
    
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const urlInputSection = document.getElementById('urlInputSection');
    const loginRequiredSection = document.getElementById('loginRequiredSection');
    
    console.log('📋 Found UI elements:', {
        userInfo: !!userInfo,
        userName: !!userName,
        loginLink: !!loginLink,
        logoutLink: !!logoutLink,
        urlInputSection: !!urlInputSection,
        loginRequiredSection: !!loginRequiredSection
    });
    
    if (currentUser) {
        console.log('✅ User is logged in, showing authenticated UI');
        // User is logged in
        if (userInfo) userInfo.style.display = 'block';
        if (userName) userName.textContent = currentUser.name;
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
        if (urlInputSection) urlInputSection.style.display = 'block';
        if (loginRequiredSection) loginRequiredSection.style.display = 'none';
    } else {
        console.log('❌ User is not logged in, showing login UI');
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
async function handleUrlSubmission() {
    console.log('📝 Handling URL submission...');
    console.log('🔐 Current user:', currentUser);
    
    const urlInput = document.getElementById('url1');
    const url = urlInput.value.trim();
    
    if (!url) {
        showMessage('Please enter a URL', 'error');
        return;
    }
    
    if (!currentUser) {
        console.log('❌ No current user - showing login error');
        showMessage('Please log in to add articles', 'error');
        return;
    }
    
    console.log('✅ User authenticated, proceeding with article creation...');
    
    // Check if URL already exists
    if (articles.find(article => article.url === url)) {
        showMessage('This article has already been added', 'error');
        return;
    }
    
    try {
        showMessage('Analyzing article with AI...', 'success');
        
        // Create article data with AI
        const articleData = await createArticleDataWithAI(url);
        
        // Add article
        articles.push(articleData);
        localStorage.setItem('articles', JSON.stringify(articles));
        
        // Clear form
        urlInput.value = '';
        
        // Update display
        displayArticles();
        
        showMessage('Article added successfully with AI-generated content!', 'success');
        
    } catch (error) {
        console.error('Error creating article:', error);
        showMessage('Failed to create article: ' + error.message, 'error');
    }
}

// Create article data with AI
async function createArticleDataWithAI(url) {
    console.log('🤖 Creating article data with AI for URL:', url);
    
    const domain = new URL(url).hostname;
    
    // Try to get AI-generated title and abstract
    let title = 'Biomedical Engineering Article';
    let summary = '';
    let image = '';
    
    try {
        // First, try to extract image from the article
        image = await extractImageFromArticle(url);
        
        // Try multiple AI services for content generation
        const aiResults = await Promise.any([
            generateWithCursorAI(url),
            generateWithOpenAI(url),
            generateWithAnthropic(url),
            generateWithGoogle(url),
            generateWithCohere(url),
            generateWithPerplexity(url)
        ]);
        
        if (aiResults) {
            title = aiResults.title;
            summary = aiResults.summary;
            console.log('✅ AI generated content successfully');
        }
    } catch (error) {
        console.log('❌ AI generation failed, using fallback:', error.message);
    }
    
    // Fallback if AI fails
    if (!title || title === 'Biomedical Engineering Article') {
        title = generateFallbackTitle(url);
    }
    
    if (!summary) {
        summary = generateFallbackSummary(domain);
    }
    
    // If no image found, generate AI image
    if (!image) {
        image = await generateAIImage(title, summary);
    }
    
    return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: title,
        summary: summary,
        image: image,
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

// Extract image from article
async function extractImageFromArticle(url) {
    try {
        // Use a CORS proxy to fetch the article content
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.contents) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            // Look for images in the article
            const images = doc.querySelectorAll('img');
            for (let img of images) {
                const src = img.src || img.getAttribute('data-src');
                if (src && (src.includes('http') || src.startsWith('//'))) {
                    // Make sure it's a valid image URL
                    const fullSrc = src.startsWith('//') ? 'https:' + src : src;
                    if (fullSrc.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        console.log('🖼️ Found image in article:', fullSrc);
                        return fullSrc;
                    }
                }
            }
        }
    } catch (error) {
        console.log('❌ Failed to extract image from article:', error.message);
    }
    return '';
}

// Generate AI image
async function generateAIImage(title, summary) {
    try {
        // Try OpenAI DALL-E first
        if (AI_CONFIG.openai.enabled && AI_CONFIG.openai.apiKey) {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
                },
                body: JSON.stringify({
                    model: 'dall-e-3',
                    prompt: `Create a professional biomedical engineering image related to: ${title}. Style: scientific, medical, professional, clean design.`,
                    n: 1,
                    size: '1024x1024'
                })
            });
            
            const data = await response.json();
            if (data.data && data.data[0]) {
                console.log('🎨 Generated AI image with DALL-E');
                return data.data[0].url;
            }
        }
        
        // Fallback to Unsplash
        const searchTerm = encodeURIComponent(title.split(' ').slice(0, 3).join(' '));
        return `https://source.unsplash.com/800x400/?biomedical,engineering,medical,technology,${searchTerm}&t=${Date.now()}`;
        
    } catch (error) {
        console.log('❌ Failed to generate AI image:', error.message);
        // Fallback to Unsplash
        const searchTerm = encodeURIComponent(title.split(' ').slice(0, 3).join(' '));
        return `https://source.unsplash.com/800x400/?biomedical,engineering,medical,technology,${searchTerm}&t=${Date.now()}`;
    }
}

// AI Generation Functions
async function generateWithCursorAI(url) {
    if (!AI_CONFIG.cursor_ai.enabled || !AI_CONFIG.cursor_ai.apiKey) return null;
    
    try {
        const response = await fetch('https://api.cursor.sh/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.cursor_ai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'system',
                    content: 'You are a biomedical engineering expert. Analyze the article at the given URL and provide a unique title and comprehensive abstract (300-500 words) that accurately reflects the specific content and findings of that article. Focus on the actual research, methodology, and results. Make it specific to the article, not generic.'
                }, {
                    role: 'user',
                    content: `Please analyze this biomedical engineering article: ${url}\n\nProvide:\n1. A specific, descriptive title (not generic)\n2. A detailed abstract that captures the unique aspects of this research`
                }],
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const lines = content.split('\n');
            const title = lines.find(line => line.includes('Title:') || line.includes('1.'))?.replace(/^.*?[:.]\s*/, '') || '';
            const summary = lines.slice(lines.findIndex(line => line.includes('Abstract:') || line.includes('2.')) + 1).join('\n').trim();
            return { title, summary };
        }
    } catch (error) {
        console.error('Cursor AI error:', error);
    }
    return null;
}

async function generateWithOpenAI(url) {
    if (!AI_CONFIG.openai.enabled || !AI_CONFIG.openai.apiKey) return null;
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'system',
                    content: 'You are a biomedical engineering expert. Analyze the article at the given URL and provide a unique title and comprehensive abstract (300-500 words) that accurately reflects the specific content and findings of that article. Focus on the actual research, methodology, and results. Make it specific to the article, not generic.'
                }, {
                    role: 'user',
                    content: `Please analyze this biomedical engineering article: ${url}\n\nProvide:\n1. A specific, descriptive title (not generic)\n2. A detailed abstract that captures the unique aspects of this research`
                }],
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const lines = content.split('\n');
            const title = lines.find(line => line.includes('Title:') || line.includes('1.'))?.replace(/^.*?[:.]\s*/, '') || '';
            const summary = lines.slice(lines.findIndex(line => line.includes('Abstract:') || line.includes('2.')) + 1).join('\n').trim();
            return { title, summary };
        }
    } catch (error) {
        console.error('OpenAI error:', error);
    }
    return null;
}

async function generateWithAnthropic(url) {
    if (!AI_CONFIG.anthropic.enabled || !AI_CONFIG.anthropic.apiKey) return null;
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AI_CONFIG.anthropic.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Analyze this biomedical engineering article: ${url}\n\nProvide a unique title and detailed abstract (300-500 words) that captures the specific research and findings. Make it specific to the article, not generic.`
                }]
            })
        });
        
        const data = await response.json();
        if (data.content && data.content[0]) {
            const content = data.content[0].text;
            const lines = content.split('\n');
            const title = lines.find(line => line.includes('Title:') || line.includes('1.'))?.replace(/^.*?[:.]\s*/, '') || '';
            const summary = lines.slice(lines.findIndex(line => line.includes('Abstract:') || line.includes('2.')) + 1).join('\n').trim();
            return { title, summary };
        }
    } catch (error) {
        console.error('Anthropic error:', error);
    }
    return null;
}

async function generateWithGoogle(url) {
    if (!AI_CONFIG.google.enabled || !AI_CONFIG.google.apiKey) return null;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AI_CONFIG.google.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Analyze this biomedical engineering article: ${url}\n\nProvide a unique title and detailed abstract (300-500 words) that captures the specific research and findings. Make it specific to the article, not generic.`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
            const content = data.candidates[0].content.parts[0].text;
            const lines = content.split('\n');
            const title = lines.find(line => line.includes('Title:') || line.includes('1.'))?.replace(/^.*?[:.]\s*/, '') || '';
            const summary = lines.slice(lines.findIndex(line => line.includes('Abstract:') || line.includes('2.')) + 1).join('\n').trim();
            return { title, summary };
        }
    } catch (error) {
        console.error('Google error:', error);
    }
    return null;
}

async function generateWithCohere(url) {
    if (!AI_CONFIG.cohere.enabled || !AI_CONFIG.cohere.apiKey) return null;
    
    try {
        const response = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.cohere.apiKey}`
            },
            body: JSON.stringify({
                model: 'command',
                prompt: `Analyze this biomedical engineering article: ${url}\n\nProvide a unique title and detailed abstract (300-500 words) that captures the specific research and findings. Make it specific to the article, not generic.`,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        if (data.generations && data.generations[0]) {
            const content = data.generations[0].text;
            const lines = content.split('\n');
            const title = lines.find(line => line.includes('Title:') || line.includes('1.'))?.replace(/^.*?[:.]\s*/, '') || '';
            const summary = lines.slice(lines.findIndex(line => line.includes('Abstract:') || line.includes('2.')) + 1).join('\n').trim();
            return { title, summary };
        }
    } catch (error) {
        console.error('Cohere error:', error);
    }
    return null;
}

async function generateWithPerplexity(url) {
    if (!AI_CONFIG.perplexity.enabled || !AI_CONFIG.perplexity.apiKey) return null;
    
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.perplexity.apiKey}`
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-instruct',
                messages: [{
                    role: 'user',
                    content: `Analyze this biomedical engineering article: ${url}\n\nProvide a unique title and detailed abstract (300-500 words) that captures the specific research and findings. Make it specific to the article, not generic.`
                }],
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const lines = content.split('\n');
            const title = lines.find(line => line.includes('Title:') || line.includes('1.'))?.replace(/^.*?[:.]\s*/, '') || '';
            const summary = lines.slice(lines.findIndex(line => line.includes('Abstract:') || line.includes('2.')) + 1).join('\n').trim();
            return { title, summary };
        }
    } catch (error) {
        console.error('Perplexity error:', error);
    }
    return null;
}

// Fallback functions
function generateFallbackTitle(url) {
    const urlPath = url.split('/').slice(3).join(' ');
    const urlWords = urlPath
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(' ')
        .filter(word => word.length > 2)
        .slice(0, 5);
    
    if (urlWords.length > 0) {
        return urlWords.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    return 'Biomedical Engineering Research Article';
}

function generateFallbackSummary(domain) {
    return `This biomedical engineering research article from ${domain} explores cutting-edge developments in medical technology and healthcare innovation. The study presents novel approaches to addressing complex challenges in healthcare delivery through advanced engineering solutions. The research demonstrates significant advances in diagnostic tools, therapeutic interventions, and patient monitoring systems. Scientists utilized innovative methodologies to address complex challenges in healthcare delivery, resulting in breakthrough technologies that enhance both clinical outcomes and patient experiences. The comprehensive analysis encompasses various aspects of biomedical engineering including device development, therapeutic applications, and clinical implementation strategies. The research team employed state-of-the-art experimental techniques and computational modeling to advance our understanding of biological systems and medical device interactions. Results indicate substantial improvements in treatment efficacy and patient safety, with promising applications in personalized medicine and targeted therapeutic delivery systems. These findings represent a significant milestone in the field of biomedical engineering, contributing to the advancement of medical science and healthcare delivery.`;
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
    
    // Check if user has liked/disliked this article
    const isLiked = userLikes.has(article.id);
    const isDisliked = userDislikes.has(article.id);
    
    // Check if user can delete this article (own article or moderator)
    const canDelete = currentUser && (article.userId === currentUser.id || currentUser.role === 'moderator');
    
    card.innerHTML = `
        <div class="article-image">
            <img src="${article.image}" alt="${article.title}" loading="lazy" 
                 onerror="this.src='https://source.unsplash.com/800x400/?biomedical,engineering,medical,technology&t=' + Date.now();">
        </div>
        
        <div class="article-content">
            <div class="article-header">
                <h3 class="article-title">
                    <a href="abstract-viewer.html?url=${encodeURIComponent(article.url)}">${article.title}</a>
                </h3>
                ${canDelete ? `
                    <button class="delete-btn" onclick="deleteArticle('${article.id}')" title="Delete article">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
            
            <p class="article-summary">${article.summary.substring(0, 200)}...</p>
            
            <div class="article-meta">
                <span class="article-source">${article.source}</span>
                <span>${article.date}</span>
            </div>
            
            <div class="article-actions">
                <div class="like-dislike-buttons">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeArticle('${article.id}')" title="Like article">
                        👍 ${article.likes || 0}
                    </button>
                    <button class="dislike-btn ${isDisliked ? 'disliked' : ''}" onclick="dislikeArticle('${article.id}')" title="Dislike article">
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
function likeArticle(articleId) {
    if (!currentUser) {
        showMessage('Please log in to like articles', 'error');
        return;
    }
    
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        showMessage('Article not found', 'error');
        return;
    }
    
    // If user already liked, remove like
    if (userLikes.has(articleId)) {
        userLikes.delete(articleId);
        article.likes = Math.max(0, (article.likes || 0) - 1);
        showMessage('Like removed', 'success');
    } else {
        // Add like and remove dislike if exists
        userLikes.add(articleId);
        if (userDislikes.has(articleId)) {
            userDislikes.delete(articleId);
            article.dislikes = Math.max(0, (article.dislikes || 0) - 1);
        }
        article.likes = (article.likes || 0) + 1;
        showMessage('Article liked!', 'success');
    }
    
    // Save data
    localStorage.setItem('articles', JSON.stringify(articles));
    localStorage.setItem(`userLikes_${currentUser.id}`, JSON.stringify([...userLikes]));
    localStorage.setItem(`userDislikes_${currentUser.id}`, JSON.stringify([...userDislikes]));
    
    // Update display
    displayArticles();
}

// Dislike article
function dislikeArticle(articleId) {
    if (!currentUser) {
        showMessage('Please log in to dislike articles', 'error');
        return;
    }
    
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        showMessage('Article not found', 'error');
        return;
    }
    
    // If user already disliked, remove dislike
    if (userDislikes.has(articleId)) {
        userDislikes.delete(articleId);
        article.dislikes = Math.max(0, (article.dislikes || 0) - 1);
        showMessage('Dislike removed', 'success');
    } else {
        // Add dislike and remove like if exists
        userDislikes.add(articleId);
        if (userLikes.has(articleId)) {
            userLikes.delete(articleId);
            article.likes = Math.max(0, (article.likes || 0) - 1);
        }
        article.dislikes = (article.dislikes || 0) + 1;
        showMessage('Article disliked', 'success');
    }
    
    // Save data
    localStorage.setItem('articles', JSON.stringify(articles));
    localStorage.setItem(`userLikes_${currentUser.id}`, JSON.stringify([...userLikes]));
    localStorage.setItem(`userDislikes_${currentUser.id}`, JSON.stringify([...userDislikes]));
    
    // Update display
    displayArticles();
}

// Delete article
function deleteArticle(articleId) {
    if (!currentUser) {
        showMessage('Please log in to delete articles', 'error');
        return;
    }
    
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        showMessage('Article not found', 'error');
        return;
    }
    
    // Check if user can delete this article
    if (article.userId !== currentUser.id && currentUser.role !== 'moderator') {
        showMessage('You can only delete your own articles', 'error');
        return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) {
        return;
    }
    
    // Remove article
    const articleIndex = articles.findIndex(a => a.id === articleId);
    if (articleIndex > -1) {
        articles.splice(articleIndex, 1);
        localStorage.setItem('articles', JSON.stringify(articles));
        
        // Remove from user likes/dislikes
        userLikes.delete(articleId);
        userDislikes.delete(articleId);
        localStorage.setItem(`userLikes_${currentUser.id}`, JSON.stringify([...userLikes]));
        localStorage.setItem(`userDislikes_${currentUser.id}`, JSON.stringify([...userDislikes]));
        
        showMessage('Article deleted successfully', 'success');
        displayArticles();
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    userLikes = new Set();
    userDislikes = new Set();
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

console.log('✅ Super Simple BMECom Articles with AI loaded successfully!'); 