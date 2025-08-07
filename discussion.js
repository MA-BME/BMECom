// Discussion Forum JavaScript
let conversations = [];
let conversationMessages = {};

// Initialize the discussion page
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    checkAuthStatus();
    displayConversations();
});

// Load data from localStorage
function loadData() {
    try {
        // Load conversations
        const conversationsData = localStorage.getItem('conversations');
        if (conversationsData) {
            conversations = JSON.parse(conversationsData);
            console.log('Loaded conversations:', conversations.length);
        } else {
            console.log('No conversations found in localStorage');
        }

        // Load conversation messages
        const messagesData = localStorage.getItem('conversationMessages');
        if (messagesData) {
            conversationMessages = JSON.parse(messagesData);
            console.log('Loaded conversation messages:', Object.keys(conversationMessages).length);
        } else {
            console.log('No conversation messages found in localStorage');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        conversations = [];
        conversationMessages = {};
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('conversations', JSON.stringify(conversations));
        localStorage.setItem('conversationMessages', JSON.stringify(conversationMessages));
        console.log('Data saved successfully:', {
            conversations: conversations.length,
            messages: Object.keys(conversationMessages).length
        });
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Topic selection
    const topicOptions = document.querySelectorAll('.topic-option input[type="checkbox"]');
    topicOptions.forEach(option => {
        option.addEventListener('change', function() {
            const label = this.closest('.topic-option');
            if (this.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    });

    // New conversation form
    const newConversationForm = document.getElementById('newConversationForm');
    if (newConversationForm) {
        newConversationForm.addEventListener('submit', handleCreateConversation);
    }
}

// Check authentication status
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const userInfoDiscussion = document.getElementById('userInfoDiscussion');
    const userNameDiscussion = document.getElementById('userNameDiscussion');

    console.log('checkAuthStatus called, currentUser:', currentUser ? currentUser.name : 'none');

    if (currentUser) {
        // User is logged in
        if (userInfoDiscussion) {
            userInfoDiscussion.style.display = 'block';
            if (userNameDiscussion) userNameDiscussion.textContent = currentUser.name;
        }
    } else {
        // User is not logged in
        console.log('User not logged in');
        if (userInfoDiscussion) userInfoDiscussion.style.display = 'none';
    }
}

// Toggle the expanding bar
function toggleExpandingBar() {
    const bar = document.getElementById('startConversationBar');
    const expandedForm = document.getElementById('expandedForm');
    
    if (!bar || !expandedForm) {
        console.error('Bar elements not found');
        return;
    }
    
    if (bar.classList.contains('expanded')) {
        // Collapse
        bar.classList.remove('expanded');
        console.log('Bar collapsed');
    } else {
        // Expand
        bar.classList.add('expanded');
        console.log('Bar expanded');
    }
}

// Handle start conversation click
function handleStartConversationClick() {
    console.log('handleStartConversationClick called');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No user logged in, showing auth message');
        showAuthRequiredMessage('create_conversation');
        return;
    }
    
    console.log('User logged in:', currentUser.name);
    
    // Toggle the expanding bar
    toggleExpandingBar();
}

// Handle create conversation from form
function handleCreateConversation(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('create_conversation');
        return;
    }
    
    const selectedTopics = document.querySelectorAll('input[name="topics"]:checked');
    const conversationName = document.getElementById('conversationName').value.trim();
    
    // Validation
    if (selectedTopics.length === 0) {
        showValidationError('Please select at least one topic.');
        return;
    }
    
    if (!conversationName) {
        showValidationError('Please enter a conversation name.');
        return;
    }
    
    // Create conversation object
    const conversation = {
        id: Date.now().toString(),
        name: conversationName,
        topics: Array.from(selectedTopics).map(topic => topic.value),
        author: currentUser.name,
        timestamp: new Date().toISOString(),
        messageCount: 0
    };
    
    // Add to conversations array
    conversations.unshift(conversation);
    console.log('Conversation added:', conversation);
    console.log('Total conversations:', conversations.length);
    
    // Initialize empty messages array for this conversation
    conversationMessages[conversation.id] = [];
    
    // Save to localStorage
    saveData();
    
    // Reset form and collapse bar
    document.getElementById('newConversationForm').reset();
    document.querySelectorAll('.topic-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Collapse the expanding bar
    const bar = document.getElementById('startConversationBar');
    if (bar) {
        bar.classList.remove('expanded');
    }
    
    showMessage('Conversation created successfully!', 'success');
    
    // Refresh display
    displayConversations();
    console.log('Display refreshed, conversations container should show:', conversations.length, 'conversations');
}

// Show validation error
function showValidationError(message) {
    const bar = document.getElementById('startConversationBar');
    if (bar) {
        bar.classList.add('invalid');
        setTimeout(() => {
            bar.classList.remove('invalid');
        }, 1000);
    }
    showMessage(message, 'error');
}

// Display conversations
function displayConversations() {
    const container = document.getElementById('conversationsContainer');
    console.log('displayConversations called, conversations:', conversations.length);
    console.log('Container element:', container);

    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="no-conversations">
                <h3>No conversations yet</h3>
                <p>Be the first to start a conversation!</p>
            </div>
        `;
        console.log('No conversations to display');
        return;
    }

    const conversationsHTML = conversations.map(conversation => {
        const messageCount = conversationMessages[conversation.id]?.length || 0;
        const topicsHTML = conversation.topics.map(topic => 
            `<span class="topic-badge">Topic ${topic}</span>`
        ).join('');

        return `
            <div class="conversation-card" onclick="openConversationDetail('${conversation.id}')">
                <div class="conversation-header">
                    <div>
                        <div class="conversation-name">${escapeHtml(conversation.name)}</div>
                        <div class="conversation-topics">${topicsHTML}</div>
                    </div>
                </div>
                <div class="conversation-meta">
                    <div class="conversation-stats">
                        <span>👤 ${escapeHtml(conversation.author)}</span>
                        <span>💬 ${messageCount} messages</span>
                        <span>📅 ${getTimeAgo(conversation.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = conversationsHTML;
    console.log('Conversations HTML set, length:', conversationsHTML.length);
    console.log('Container innerHTML length:', container.innerHTML.length);
}



// Create message HTML
function createMessageHTML(message, conversationId) {
    const replies = message.replies || [];
    const currentUser = getCurrentUser();
    const repliesHTML = replies.length > 0 ? `
        <div class="replies-container">
            ${replies.map(reply => createReplyHTML(reply, conversationId, message.id)).join('')}
        </div>
    ` : '';

    return `
        <div class="message" id="message-${message.id}">
            <div class="message-header">
                <span class="message-author">${escapeHtml(message.author)}</span>
                <span class="message-time">${getTimeAgo(message.timestamp)}</span>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
            <div class="message-actions">
                <button class="message-btn ${message.likes?.includes(currentUser?.name) ? 'liked' : ''}" 
                        onclick="handleMessageLike('${conversationId}', '${message.id}')">
                    👍 ${message.likes?.length || 0}
                </button>
                <button class="message-btn ${message.dislikes?.includes(currentUser?.name) ? 'disliked' : ''}" 
                        onclick="handleMessageDislike('${conversationId}', '${message.id}')">
                    👎 ${message.dislikes?.length || 0}
                </button>
                ${currentUser ? `
                    <button class="message-btn reply-btn" onclick="toggleReplyForm('${conversationId}', '${message.id}')">
                        💬 Reply
                    </button>
                ` : ''}
            </div>
            <div class="reply-form" id="reply-form-${message.id}" style="display: none; margin-top: 1rem;">
                <form onsubmit="handleSendReply(event, '${conversationId}', '${message.id}')">
                    <textarea class="message-input" name="replyContent" placeholder="Type your reply..." required style="min-height: 40px;"></textarea>
                    <button type="submit" class="send-message-btn" style="margin-top: 0.5rem;">Send Reply</button>
                </form>
            </div>
            ${repliesHTML}
        </div>
    `;
}

// Create reply HTML
function createReplyHTML(reply, conversationId, parentMessageId) {
    const currentUser = getCurrentUser();
    return `
        <div class="reply" id="reply-${reply.id}">
            <div class="message-header">
                <span class="message-author">${escapeHtml(reply.author)}</span>
                <span class="message-time">${getTimeAgo(reply.timestamp)}</span>
            </div>
            <div class="message-content">${escapeHtml(reply.content)}</div>
            <div class="message-actions">
                <button class="message-btn ${reply.likes?.includes(currentUser?.name) ? 'liked' : ''}" 
                        onclick="handleReplyLike('${conversationId}', '${parentMessageId}', '${reply.id}')">
                    👍 ${reply.likes?.length || 0}
                </button>
                <button class="message-btn ${reply.dislikes?.includes(currentUser?.name) ? 'disliked' : ''}" 
                        onclick="handleReplyDislike('${conversationId}', '${parentMessageId}', '${reply.id}')">
                    👎 ${reply.dislikes?.length || 0}
                </button>
            </div>
        </div>
    `;
}

// Open conversation detail page
function openConversationDetail(conversationId) {
    window.location.href = `conversation-detail.html?id=${conversationId}`;
}

// Handle sending a message
function handleSendMessage(e, conversationId) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('send_message');
        return;
    }

    const form = e.target;
    const textarea = form.querySelector('.message-input');
    const content = textarea.value.trim();

    if (!content) {
        showMessage('Please enter a message', 'error');
        return;
    }

    // Filter curse words
    const filteredContent = filterCurseWords(content);

    const message = {
        id: Date.now().toString(),
        content: filteredContent,
        author: currentUser.name,
        timestamp: new Date().toISOString(),
        likes: [],
        dislikes: [],
        replies: []
    };

    if (!conversationMessages[conversationId]) {
        conversationMessages[conversationId] = [];
    }
    conversationMessages[conversationId].push(message);

    // Update conversation message count
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        conversation.messageCount = conversationMessages[conversationId].length;
    }

    saveData();
    displayConversations();

    // Reset form
    textarea.value = '';

    showMessage('Message sent successfully!', 'success');
}

// Handle sending a reply
function handleSendReply(e, conversationId, parentMessageId) {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('send_message');
        return;
    }

    const form = e.target;
    const textarea = form.querySelector('.message-input');
    const content = textarea.value.trim();

    if (!content) {
        showMessage('Please enter a reply', 'error');
        return;
    }

    // Filter curse words
    const filteredContent = filterCurseWords(content);

    const reply = {
        id: Date.now().toString(),
        content: filteredContent,
        author: currentUser.name,
        timestamp: new Date().toISOString(),
        likes: [],
        dislikes: []
    };

    // Find the parent message and add the reply
    const messages = conversationMessages[conversationId];
    const parentMessage = messages.find(m => m.id === parentMessageId);
    if (parentMessage) {
        if (!parentMessage.replies) {
            parentMessage.replies = [];
        }
        parentMessage.replies.push(reply);
    }

    saveData();
    displayConversations();

    // Reset form and hide it
    textarea.value = '';
    document.getElementById(`reply-form-${parentMessageId}`).style.display = 'none';

    showMessage('Reply sent successfully!', 'success');
}

// Handle message like
function handleMessageLike(conversationId, messageId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to like messages', 'error');
        return;
    }

    const messages = conversationMessages[conversationId];
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
        if (!message.likes) message.likes = [];
        if (!message.dislikes) message.dislikes = [];

        const userIndex = message.likes.indexOf(currentUser.name);
        const dislikeIndex = message.dislikes.indexOf(currentUser.name);

        if (userIndex === -1) {
            // Add like
            message.likes.push(currentUser.name);
            if (dislikeIndex !== -1) {
                message.dislikes.splice(dislikeIndex, 1);
            }
        } else {
            // Remove like
            message.likes.splice(userIndex, 1);
        }

        saveData();
        displayConversations();
    }
}

// Handle message dislike
function handleMessageDislike(conversationId, messageId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to dislike messages', 'error');
        return;
    }

    const messages = conversationMessages[conversationId];
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
        if (!message.likes) message.likes = [];
        if (!message.dislikes) message.dislikes = [];

        const userIndex = message.dislikes.indexOf(currentUser.name);
        const likeIndex = message.likes.indexOf(currentUser.name);

        if (userIndex === -1) {
            // Add dislike
            message.dislikes.push(currentUser.name);
            if (likeIndex !== -1) {
                message.likes.splice(likeIndex, 1);
            }
        } else {
            // Remove dislike
            message.dislikes.splice(userIndex, 1);
        }

        saveData();
        displayConversations();
    }
}

// Handle reply like
function handleReplyLike(conversationId, parentMessageId, replyId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to like replies', 'error');
        return;
    }

    const messages = conversationMessages[conversationId];
    const parentMessage = messages.find(m => m.id === parentMessageId);
    const reply = parentMessage?.replies?.find(r => r.id === replyId);
    
    if (reply) {
        if (!reply.likes) reply.likes = [];
        if (!reply.dislikes) reply.dislikes = [];

        const userIndex = reply.likes.indexOf(currentUser.name);
        const dislikeIndex = reply.dislikes.indexOf(currentUser.name);

        if (userIndex === -1) {
            reply.likes.push(currentUser.name);
            if (dislikeIndex !== -1) {
                reply.dislikes.splice(dislikeIndex, 1);
            }
        } else {
            reply.likes.splice(userIndex, 1);
        }

        saveData();
        displayConversations();
    }
}

// Handle reply dislike
function handleReplyDislike(conversationId, parentMessageId, replyId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to dislike replies', 'error');
        return;
    }

    const messages = conversationMessages[conversationId];
    const parentMessage = messages.find(m => m.id === parentMessageId);
    const reply = parentMessage?.replies?.find(r => r.id === replyId);
    
    if (reply) {
        if (!reply.likes) reply.likes = [];
        if (!reply.dislikes) reply.dislikes = [];

        const userIndex = reply.dislikes.indexOf(currentUser.name);
        const likeIndex = reply.likes.indexOf(currentUser.name);

        if (userIndex === -1) {
            reply.dislikes.push(currentUser.name);
            if (likeIndex !== -1) {
                reply.likes.splice(likeIndex, 1);
            }
        } else {
            reply.dislikes.splice(userIndex, 1);
        }

        saveData();
        displayConversations();
    }
}

// Toggle reply form
function toggleReplyForm(conversationId, messageId) {
    const replyForm = document.getElementById(`reply-form-${messageId}`);
    const isVisible = replyForm.style.display !== 'none';
    
    // Hide all reply forms
    document.querySelectorAll('.reply-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Toggle current reply form
    if (!isVisible) {
        replyForm.style.display = 'block';
        replyForm.querySelector('.message-input').focus();
    }
}

// Filter curse words
function filterCurseWords(text) {
    const curseWords = [
        'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap', 'piss', 'dick', 'cock',
        'pussy', 'cunt', 'whore', 'slut', 'bastard', 'motherfucker', 'fucker', 'fucking',
        'shitty', 'asshole', 'dumbass', 'jackass', 'bullshit', 'horseshit', 'fuckface'
    ];
    
    let filteredText = text.toLowerCase();
    curseWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    
    return filteredText;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
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
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, 3000);
}

// Test function for debugging bar
function testBar() {
    console.log('=== BAR DEBUG TEST ===');
    
    const bar = document.getElementById('startConversationBar');
    const expandedForm = document.getElementById('expandedForm');
    
    console.log('Bar element:', bar);
    console.log('Expanded form element:', expandedForm);
    
    if (bar) {
        console.log('Bar display:', bar.style.display);
        console.log('Bar visibility:', bar.style.visibility);
        console.log('Bar opacity:', bar.style.opacity);
        console.log('Bar expanded:', bar.classList.contains('expanded'));
        console.log('Bar position:', bar.style.position);
        console.log('Bar z-index:', bar.style.zIndex);
        
        // Force show the bar
        bar.style.display = 'flex';
        bar.style.visibility = 'visible';
        bar.style.opacity = '1';
        bar.style.zIndex = '1000';
        bar.style.position = 'fixed';
        bar.style.bottom = '30px';
        bar.style.right = '30px';
        
        console.log('Bar should now be visible');
    }
    
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
}

// Add CSS animations
const discussionStyle = document.createElement('style');
discussionStyle.textContent = `
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
document.head.appendChild(discussionStyle);
