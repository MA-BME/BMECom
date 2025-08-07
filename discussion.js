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
        }

        // Load conversation messages
        const messagesData = localStorage.getItem('conversationMessages');
        if (messagesData) {
            conversationMessages = JSON.parse(messagesData);
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

    // Logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Toggle conversation bubble
function toggleConversationBubble() {
    const bubble = document.getElementById('conversationBubble');
    const form = document.getElementById('newConversationFormBubble');
    const plusSign = document.getElementById('plusSign');
    
    if (bubble.classList.contains('expanded')) {
        // Collapse
        bubble.classList.remove('expanded');
        form.style.display = 'none';
        plusSign.style.display = 'block';
    } else {
        // Expand
        bubble.classList.add('expanded');
        form.style.display = 'flex';
        plusSign.style.display = 'none';
    }
}

// Handle creating conversation from bubble
function handleCreateConversationFromBubble() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('create_conversation');
        return;
    }

    const selectedTopics = Array.from(document.querySelectorAll('#conversationBubble input[name="topics"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedTopics.length === 0) {
        showMessage('Please select at least one topic', 'error');
        // Add red animation to the bubble
        const bubble = document.getElementById('conversationBubble');
        bubble.classList.add('invalid');
        setTimeout(() => bubble.classList.remove('invalid'), 1000);
        return;
    }

    const conversationName = document.getElementById('conversationNameBubble').value.trim();
    if (!conversationName) {
        showMessage('Please enter a conversation name', 'error');
        // Add red animation to the bubble
        const bubble = document.getElementById('conversationBubble');
        bubble.classList.add('invalid');
        setTimeout(() => bubble.classList.remove('invalid'), 1000);
        return;
    }

    // Create new conversation
    const newConversation = {
        id: Date.now().toString(),
        name: conversationName,
        topics: selectedTopics,
        author: currentUser.name,
        timestamp: new Date().toISOString(),
        messageCount: 0
    };

    conversations.unshift(newConversation);
    conversationMessages[newConversation.id] = [];

    saveData();
    displayConversations();

    // Reset form and collapse the bubble
    document.getElementById('conversationNameBubble').value = '';
    document.querySelectorAll('#conversationBubble input[name="topics"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('#conversationBubble .topic-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Collapse the conversation bubble back to + sign
    toggleConversationBubble();

    showMessage('Conversation created successfully!', 'success');
}

// Check authentication status
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const newConversationSection = document.getElementById('newConversationSection');
    const conversationBubble = document.getElementById('conversationBubble');
    const userInfoDiscussion = document.getElementById('userInfoDiscussion');
    const userNameDiscussion = document.getElementById('userNameDiscussion');

    if (currentUser) {
        // User is logged in
        if (newConversationSection) newConversationSection.style.display = 'none';
        if (conversationBubble) conversationBubble.style.display = 'flex';
        if (userInfoDiscussion) {
            userInfoDiscussion.style.display = 'block';
            if (userNameDiscussion) userNameDiscussion.textContent = currentUser.name;
        }
    } else {
        // User is not logged in
        if (newConversationSection) newConversationSection.style.display = 'none';
        if (conversationBubble) conversationBubble.style.display = 'none';
        if (userInfoDiscussion) userInfoDiscussion.style.display = 'none';
    }
}

// Handle creating a new conversation
function handleCreateConversation(e) {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAuthRequiredMessage('create_conversation');
        return;
    }

    const selectedTopics = Array.from(document.querySelectorAll('input[name="topics"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedTopics.length === 0) {
        showMessage('Please select at least one topic', 'error');
        // Add red animation to the form
        const form = document.getElementById('newConversationForm');
        form.classList.add('invalid');
        setTimeout(() => form.classList.remove('invalid'), 1000);
        return;
    }

    const conversationName = document.getElementById('conversationName').value.trim();
    if (!conversationName) {
        showMessage('Please enter a conversation name', 'error');
        // Add red animation to the form
        const form = document.getElementById('newConversationForm');
        form.classList.add('invalid');
        setTimeout(() => form.classList.remove('invalid'), 1000);
        return;
    }

    // Create new conversation
    const newConversation = {
        id: Date.now().toString(),
        name: conversationName,
        topics: selectedTopics,
        author: currentUser.name,
        timestamp: new Date().toISOString(),
        messageCount: 0
    };

    conversations.unshift(newConversation);
    conversationMessages[newConversation.id] = [];

    saveData();
    displayConversations();

    // Reset form and collapse the bubble
    document.getElementById('newConversationForm').reset();
    document.querySelectorAll('.topic-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Collapse the conversation bubble back to + sign
    toggleConversationBubble();

    showMessage('Conversation created successfully!', 'success');
}

// Display conversations
function displayConversations() {
    const container = document.getElementById('conversationsContainer');

    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="no-conversations">
                <h3>No conversations yet</h3>
                <p>Be the first to start a conversation!</p>
            </div>
        `;
        return;
    }

    const conversationsHTML = conversations.map(conversation => {
        const messageCount = conversationMessages[conversation.id]?.length || 0;
        const topicsHTML = conversation.topics.map(topic => 
            `<span class="topic-badge">Topic ${topic}</span>`
        ).join('');

        return `
            <div class="conversation-card" onclick="toggleConversationDetail('${conversation.id}')">
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
                <div class="conversation-detail" id="conversation-${conversation.id}">
                    ${createConversationDetailHTML(conversation)}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = conversationsHTML;
}

// Create conversation detail HTML
function createConversationDetailHTML(conversation) {
    const messages = conversationMessages[conversation.id] || [];
    const currentUser = getCurrentUser();
    
    return `
        <div class="messages-container">
            ${messages.length === 0 ? 
                '<p style="text-align: center; color: #6b7280;">No messages yet. Be the first to comment!</p>' :
                messages.map(message => createMessageHTML(message, conversation.id)).join('')
            }
        </div>
        ${currentUser ? `
            <form class="new-message-form" onsubmit="handleSendMessage(event, '${conversation.id}')">
                <textarea class="message-input" placeholder="Type your message..." required></textarea>
                <button type="submit" class="send-message-btn">Send Message</button>
            </form>
        ` : `
            <div style="text-align: center; padding: 1rem; color: #6b7280;">
                <p>Please login to participate in this conversation.</p>
            </div>
        `}
    `;
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
                    <textarea class="message-input" placeholder="Type your reply..." required style="min-height: 40px;"></textarea>
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

// Toggle conversation detail
function toggleConversationDetail(conversationId) {
    const detailElement = document.getElementById(`conversation-${conversationId}`);
    const isActive = detailElement.classList.contains('active');
    
    // Close all other conversation details
    document.querySelectorAll('.conversation-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Toggle current conversation detail
    if (!isActive) {
        detailElement.classList.add('active');
    }
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



// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);
