// Conversation Detail Page JavaScript
let currentConversation = null;
let conversationMessages = [];

// Initialize the conversation detail page
document.addEventListener('DOMContentLoaded', function() {
    loadConversation();
    setupEventListeners();
});

// Load conversation data from URL parameter and localStorage
function loadConversation() {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');
    
    if (!conversationId) {
        showError('No conversation ID provided');
        return;
    }
    
    try {
        // Load conversations from localStorage
        const conversationsData = localStorage.getItem('conversations');
        if (!conversationsData) {
            showError('No conversations found');
            return;
        }
        
        const conversations = JSON.parse(conversationsData);
        currentConversation = conversations.find(c => c.id === conversationId);
        
        if (!currentConversation) {
            showError('Conversation not found');
            return;
        }
        
        // Load conversation messages
        const messagesData = localStorage.getItem('conversationMessages');
        if (messagesData) {
            const allMessages = JSON.parse(messagesData);
            conversationMessages = allMessages[conversationId] || [];
        }
        
        // Display conversation
        displayConversation();
        displayMessages();
        
    } catch (error) {
        console.error('Error loading conversation:', error);
        showError('Error loading conversation');
    }
}

// Display conversation header
function displayConversation() {
    const headerContainer = document.getElementById('conversationHeader');
    const currentUser = getCurrentUser();
    
    const topicsHTML = currentConversation.topics.map(topic => 
        `<span class="topic-badge">Topic ${topic}</span>`
    ).join('');
    
    // Check if current user can delete this conversation (author or moderator)
    const canDelete = currentUser && (currentUser.name === currentConversation.author || currentUser.role === 'Moderator');
    
    headerContainer.innerHTML = `
        <div class="conversation-header-content">
            <h1 class="conversation-title">${escapeHtml(currentConversation.name)}</h1>
            ${canDelete ? `
                <button class="delete-conversation-btn" onclick="handleDeleteConversation()" title="Delete conversation">
                    🗑️ Delete Conversation
                </button>
            ` : ''}
        </div>
        <div class="conversation-meta">
            <span>👤 ${escapeHtml(currentConversation.author)}</span>
            <span>💬 ${conversationMessages.length} messages</span>
            <span>📅 ${getTimeAgo(currentConversation.timestamp)}</span>
        </div>
        <div class="conversation-topics">
            ${topicsHTML}
        </div>
    `;
}

// Display messages
function displayMessages() {
    const messagesContainer = document.getElementById('messagesSection');
    const currentUser = getCurrentUser();
    
    if (conversationMessages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="messages-header">
                <h2 class="messages-title">Messages</h2>
            </div>
            <div class="no-messages">
                <h3>No messages yet</h3>
                <p>Be the first to comment on this conversation!</p>
            </div>
            ${currentUser ? `
                <form class="new-message-form" onsubmit="handleSendMessage(event)">
                    <textarea class="message-input" name="messageContent" placeholder="Type your message..." required></textarea>
                    <button type="submit" class="send-message-btn">Send Message</button>
                </form>
            ` : `
                <div class="login-required">
                    <p>Please login to participate in this conversation.</p>
                </div>
            `}
        `;
        return;
    }
    
    const messagesHTML = conversationMessages.map(message => createMessageHTML(message)).join('');
    
    messagesContainer.innerHTML = `
        <div class="messages-header">
            <h2 class="messages-title">Messages (${conversationMessages.length})</h2>
        </div>
        <div class="messages-container">
            ${messagesHTML}
        </div>
        ${currentUser ? `
            <form class="new-message-form" onsubmit="handleSendMessage(event)">
                <textarea class="message-input" name="messageContent" placeholder="Type your message..." required></textarea>
                <button type="submit" class="send-message-btn">Send Message</button>
            </form>
        ` : `
            <div class="login-required">
                <p>Please login to participate in this conversation.</p>
            </div>
        `}
    `;
}

// Create message HTML
function createMessageHTML(message) {
    const replies = message.replies || [];
    const currentUser = getCurrentUser();
    const repliesHTML = replies.length > 0 ? `
        <div class="replies-container">
            ${replies.map(reply => createReplyHTML(reply, message.id)).join('')}
        </div>
    ` : '';

    // Check if current user can delete this message (author or moderator)
    const canDeleteMessage = currentUser && (currentUser.name === message.author || currentUser.role === 'Moderator');

    return `
        <div class="message" id="message-${message.id}">
            <div class="message-header">
                <span class="message-author">${escapeHtml(message.author)}</span>
                <div class="message-header-actions">
                    <span class="message-time">${getTimeAgo(message.timestamp)}</span>
                    ${canDeleteMessage ? `
                        <button class="delete-message-btn" onclick="handleDeleteMessage('${message.id}')" title="Delete message">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
            <div class="message-actions">
                <button class="message-btn ${message.likes?.includes(currentUser?.name) ? 'liked' : ''}" 
                        onclick="handleMessageLike('${message.id}')">
                    👍 ${message.likes?.length || 0}
                </button>
                <button class="message-btn ${message.dislikes?.includes(currentUser?.name) ? 'disliked' : ''}" 
                        onclick="handleMessageDislike('${message.id}')">
                    👎 ${message.dislikes?.length || 0}
                </button>
                ${currentUser ? `
                    <button class="message-btn reply-btn" onclick="toggleReplyForm('${message.id}')">
                        💬 Reply
                    </button>
                ` : ''}
            </div>
            <div class="reply-form" id="reply-form-${message.id}" style="display: none;">
                <form onsubmit="handleSendReply(event, '${message.id}')">
                    <textarea class="message-input" name="replyContent" placeholder="Type your reply..." required style="min-height: 40px;"></textarea>
                    <button type="submit" class="send-message-btn" style="margin-top: 0.5rem;">Send Reply</button>
                </form>
            </div>
            ${repliesHTML}
        </div>
    `;
}

// Create reply HTML
function createReplyHTML(reply, parentMessageId) {
    const currentUser = getCurrentUser();
    
    // Check if current user can delete this reply (author or moderator)
    const canDeleteReply = currentUser && (currentUser.name === reply.author || currentUser.role === 'Moderator');
    
    return `
        <div class="reply" id="reply-${reply.id}">
            <div class="message-header">
                <span class="message-author">${escapeHtml(reply.author)}</span>
                <div class="message-header-actions">
                    <span class="message-time">${getTimeAgo(reply.timestamp)}</span>
                    ${canDeleteReply ? `
                        <button class="delete-message-btn" onclick="handleDeleteReply('${parentMessageId}', '${reply.id}')" title="Delete reply">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="message-content">${escapeHtml(reply.content)}</div>
            <div class="message-actions">
                <button class="message-btn ${reply.likes?.includes(currentUser?.name) ? 'liked' : ''}" 
                        onclick="handleReplyLike('${parentMessageId}', '${reply.id}')">
                    👍 ${reply.likes?.length || 0}
                </button>
                <button class="message-btn ${reply.dislikes?.includes(currentUser?.name) ? 'disliked' : ''}" 
                        onclick="handleReplyDislike('${parentMessageId}', '${reply.id}')">
                    👎 ${reply.dislikes?.length || 0}
                </button>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Any additional event listeners can be added here
}

// Handle sending a message
function handleSendMessage(e) {
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

    conversationMessages.push(message);

    // Save to localStorage
    saveMessages();

    // Refresh display
    displayMessages();

    // Reset form
    textarea.value = '';

    showMessage('Message sent successfully!', 'success');
}

// Handle sending a reply
function handleSendReply(e, parentMessageId) {
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
    const parentMessage = conversationMessages.find(m => m.id === parentMessageId);
    if (parentMessage) {
        if (!parentMessage.replies) {
            parentMessage.replies = [];
        }
        parentMessage.replies.push(reply);
    }

    // Save to localStorage
    saveMessages();

    // Refresh display
    displayMessages();

    // Reset form and hide it
    textarea.value = '';
    document.getElementById(`reply-form-${parentMessageId}`).style.display = 'none';

    showMessage('Reply sent successfully!', 'success');
}

// Handle message like
function handleMessageLike(messageId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to like messages', 'error');
        return;
    }

    const message = conversationMessages.find(m => m.id === messageId);
    
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

        saveMessages();
        displayMessages();
    }
}

// Handle message dislike
function handleMessageDislike(messageId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to dislike messages', 'error');
        return;
    }

    const message = conversationMessages.find(m => m.id === messageId);
    
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

        saveMessages();
        displayMessages();
    }
}

// Handle reply like
function handleReplyLike(parentMessageId, replyId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to like replies', 'error');
        return;
    }

    const parentMessage = conversationMessages.find(m => m.id === parentMessageId);
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

        saveMessages();
        displayMessages();
    }
}

// Handle reply dislike
function handleReplyDislike(parentMessageId, replyId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Please login to dislike replies', 'error');
        return;
    }

    const parentMessage = conversationMessages.find(m => m.id === parentMessageId);
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

        saveMessages();
        displayMessages();
    }
}

// Toggle reply form
function toggleReplyForm(messageId) {
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

// Save messages to localStorage
function saveMessages() {
    try {
        const allMessages = JSON.parse(localStorage.getItem('conversationMessages') || '{}');
        allMessages[currentConversation.id] = conversationMessages;
        localStorage.setItem('conversationMessages', JSON.stringify(allMessages));
    } catch (error) {
        console.error('Error saving messages:', error);
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

// Handle delete conversation
function handleDeleteConversation() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('delete_conversation');
        return;
    }

    if (!currentConversation) {
        showMessage('Conversation not found', 'error');
        return;
    }

    // Check if user can delete (author or moderator)
    if (currentUser.name !== currentConversation.author && currentUser.role !== 'Moderator') {
        showMessage('You can only delete your own conversations', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
        try {
            // Load all conversations from localStorage
            const conversationsData = localStorage.getItem('conversations');
            if (conversationsData) {
                const conversations = JSON.parse(conversationsData);
                // Remove this conversation
                const updatedConversations = conversations.filter(c => c.id !== currentConversation.id);
                localStorage.setItem('conversations', JSON.stringify(updatedConversations));
            }

            // Load all conversation messages from localStorage
            const messagesData = localStorage.getItem('conversationMessages');
            if (messagesData) {
                const allMessages = JSON.parse(messagesData);
                // Remove messages for this conversation
                delete allMessages[currentConversation.id];
                localStorage.setItem('conversationMessages', JSON.stringify(allMessages));
            }

            showMessage('Conversation deleted successfully', 'success');
            
            // Redirect back to discussion page
            setTimeout(() => {
                window.location.href = 'discussion.html';
            }, 1500);
        } catch (error) {
            console.error('Error deleting conversation:', error);
            showMessage('Error deleting conversation', 'error');
        }
    }
}

// Handle delete message
function handleDeleteMessage(messageId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('delete_message');
        return;
    }

    const message = conversationMessages.find(m => m.id === messageId);
    if (!message) {
        showMessage('Message not found', 'error');
        return;
    }

    // Check if user can delete (author or moderator)
    if (currentUser.name !== message.author && currentUser.role !== 'Moderator') {
        showMessage('You can only delete your own messages', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
        // Remove message from conversationMessages array
        conversationMessages = conversationMessages.filter(m => m.id !== messageId);
        
        // Save to localStorage
        saveMessages();
        
        // Refresh display
        displayMessages();
        
        showMessage('Message deleted successfully', 'success');
    }
}

// Handle delete reply
function handleDeleteReply(parentMessageId, replyId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('delete_reply');
        return;
    }

    const parentMessage = conversationMessages.find(m => m.id === parentMessageId);
    if (!parentMessage || !parentMessage.replies) {
        showMessage('Reply not found', 'error');
        return;
    }

    const reply = parentMessage.replies.find(r => r.id === replyId);
    if (!reply) {
        showMessage('Reply not found', 'error');
        return;
    }

    // Check if user can delete (author or moderator)
    if (currentUser.name !== reply.author && currentUser.role !== 'Moderator') {
        showMessage('You can only delete your own replies', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
        // Remove reply from parent message
        parentMessage.replies = parentMessage.replies.filter(r => r.id !== replyId);
        
        // Save to localStorage
        saveMessages();
        
        // Refresh display
        displayMessages();
        
        showMessage('Reply deleted successfully', 'success');
    }
}

function showError(message) {
    const headerContainer = document.getElementById('conversationHeader');
    const messagesContainer = document.getElementById('messagesSection');
    
    headerContainer.innerHTML = `<div class="error-message">${message}</div>`;
    messagesContainer.innerHTML = '';
}

// Add CSS animations
const conversationDetailStyle = document.createElement('style');
conversationDetailStyle.textContent = `
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
document.head.appendChild(conversationDetailStyle);
