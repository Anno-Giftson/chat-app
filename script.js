// Browser-only storage
let users = JSON.parse(localStorage.getItem('users') || '{}');
let chats = JSON.parse(localStorage.getItem('chats') || '{}');
let currentUser = localStorage.getItem('currentUser') || null;

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('chats', JSON.stringify(chats));
}

// Utility to generate code
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Sign up
function signup() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Enter username');
    if (users[username]) return alert('Username exists');
    const code = generateCode();
    users[username] = { code, friends: [], friendRequests: [] };
    saveData();
    document.getElementById('signupCode').innerText = `Your code: ${code}`;
}

// Login
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    if (!users[username]) return alert('User not found');
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('friendSection').style.display = 'block';
    loadUserData();
}

function deleteAccount() {
    if (!currentUser) return alert('No user logged in');
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    // 1. Remove user from users object
    delete users[currentUser];

    // 2. Remove this user from friends lists and friendRequests of other users
    for (let user in users) {
        users[user].friends = users[user].friends.filter(f => f !== currentUser);
        users[user].friendRequests = users[user].friendRequests.filter(f => f !== currentUser);
    }

    // 3. Remove all chats that involve this user
    for (let chatId in chats) {
        if (chatId.includes(currentUser)) {
            delete chats[chatId];
        }
    }

    // 4. Save changes to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.removeItem('currentUser');
    currentUser = null;

    alert('Account deleted successfully!');

    // Reload page to show signup/login again
    location.reload();
}

// Load friend requests and friends
function loadUserData() {
    if (!currentUser) return;
    const user = users[currentUser];

    const frList = document.getElementById('friendRequests');
    frList.innerHTML = '';
    user.friendRequests.forEach(f => {
        const li = document.createElement('li');
        li.innerText = f;
        const btn = document.createElement('button');
        btn.innerText = 'Accept';
        btn.onclick = () => acceptFriend(f);
        li.appendChild(btn);
        frList.appendChild(li);
    });

    const fList = document.getElementById('friendsList');
    fList.innerHTML = '';
    user.friends.forEach(f => {
        const li = document.createElement('li');
        li.innerText = f;
        const btn = document.createElement('button');
        btn.innerText = 'Chat';
        btn.onclick = () => openChat(f);
        li.appendChild(btn);
        fList.appendChild(li);
    });
}

// Send friend request
function sendFriendRequest() {
    const code = document.getElementById('friendCodeInput').value.trim();
    let found = false;
    for (let user in users) {
        if (users[user].code === code) {
            users[user].friendRequests.push(currentUser);
            saveData();
            alert('Friend request sent!');
            found = true;
            break;
        }
    }
    if (!found) alert('Code not found');
}

// Accept friend
function acceptFriend(friend) {
    users[currentUser].friends.push(friend);
    users[friend].friends.push(currentUser);
    users[currentUser].friendRequests = users[currentUser].friendRequests.filter(f => f !== friend);
    saveData();
    loadUserData();
}

// Open chat
function openChat(friend) {
    localStorage.setItem('chatFriend', friend);
    window.location.href = 'chat.html';
}

// Chat functionality
if (window.location.pathname.endsWith('chat.html')) {
    const chatBox = document.getElementById('chatBox');
    const friend = localStorage.getItem('chatFriend');
    currentUser = localStorage.getItem('currentUser');
    document.getElementById('friendName').innerText = friend;
    const chatId = [currentUser, friend].sort().join('_');
    if (!chats[chatId]) chats[chatId] = [];

    function renderChat() {
    chatBox.innerHTML = '';
    chats[chatId].forEach((m, index) => {
        const p = document.createElement('p');
        p.className = 'message';
        p.innerText = `${m.sender}: ${m.text}`;

        // Add friend class for messages from the other person
        if (m.sender !== currentUser) {
            p.classList.add('friend');
        }

        // Only show delete button for messages sent by currentUser
        if (m.sender === currentUser) {
            const btn = document.createElement('button');
            btn.innerText = 'Delete';
            btn.style.marginLeft = '10px';
            btn.onclick = () => deleteMessage(index);
            p.appendChild(btn);
        }

        chatBox.appendChild(p);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Auto-refresh chat every 1 second (1000 ms)
setInterval(() => {
    // Reload chats from localStorage in case your friend added a message
    chats = JSON.parse(localStorage.getItem('chats') || '{}');
    renderChat();
}, 1000);

function deleteMessage(index) {
    if (confirm('Are you sure you want to delete this message?')) {
        chats[chatId].splice(index, 1); // remove message from array
        localStorage.setItem('chats', JSON.stringify(chats)); // save updated chats
        renderChat(); // re-render chat instantly
    }
}

    window.sendMessage = function() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (!text) return;
        chats[chatId].push({ sender: currentUser, text });
        saveData();
        input.value = '';
        renderChat();
    }

    renderChat();
}
