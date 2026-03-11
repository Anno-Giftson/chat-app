// ======== STORAGE ========
let users = JSON.parse(localStorage.getItem('users') || '{}');
let chats = JSON.parse(localStorage.getItem('chats') || '{}');
let currentUser = localStorage.getItem('currentUser') || null;

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('chats', JSON.stringify(chats));
}

// ======== HELPER ========
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function showMsg(msg, type='info', target='loginMsg') {
    const box = document.getElementById(target);
    if (!box) return;
    box.innerText = msg;
    box.style.color = type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#333';
    box.style.fontWeight = 'bold';
    setTimeout(() => { box.innerText = ''; }, 4000);
}

// ======== SIGNUP ========
function signup() {
    const username = document.getElementById('username').value.trim();
    if (!username) return showMsg('Enter a username', 'error', 'signupMsg');
    if (users[username]) return showMsg('Username exists', 'error', 'signupMsg');

    const code = generateCode();
    users[username] = { code, friends: [], friendRequests: [] };
    saveData();

    showMsg(`Signup successful! Your code: ${code}`, 'success', 'signupMsg');
    document.getElementById('signupCode').innerText = `Your code: ${code}`;
}

// ======== LOGIN ========
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    if (!users[username]) return showMsg('User not found', 'error', 'loginMsg');

    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('friendSection').style.display = 'block';
    showMsg(`Logged in as ${username}`, 'success', 'loginMsg');
    loadUserData();
}

// ======== FRIENDS & REQUESTS ========
function loadUserData() {
    if (!currentUser) return;
    const user = users[currentUser];

    // Friend requests
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

    // Friends list
    const fList = document.getElementById('friendsList');
    fList.innerHTML = '';
    user.friends.forEach(f => {
        const li = document.createElement('li');
        li.innerText = f;

        const chatBtn = document.createElement('button');
        chatBtn.innerText = 'Chat';
        chatBtn.onclick = () => openChat(f);
        chatBtn.style.marginRight = '5px';

        const delBtn = document.createElement('button');
        delBtn.innerText = 'Delete';
        delBtn.style.backgroundColor = '#f44336';
        delBtn.onclick = () => deleteFriend(f);

        li.appendChild(chatBtn);
        li.appendChild(delBtn);
        fList.appendChild(li);
    });
}

function sendFriendRequest() {
    const code = document.getElementById('friendCodeInput').value.trim();
    let found = false;

    for (let user in users) {
        if (users[user].code === code && user !== currentUser) {
            users[user].friendRequests.push(currentUser);
            saveData();
            showMsg(`Friend request sent to ${user}`, 'success', 'friendMsg');
            found = true;
            break;
        }
    }
    if (!found) showMsg('Code not found', 'error', 'friendMsg');
}

function acceptFriend(friend) {
    users[currentUser].friends.push(friend);
    users[friend].friends.push(currentUser);
    users[currentUser].friendRequests = users[currentUser].friendRequests.filter(f => f !== friend);
    saveData();
    loadUserData();
}

function deleteFriend(friend) {
    if (!confirm(`Are you sure you want to remove ${friend} from your friends?`)) return;
    users[currentUser].friends = users[currentUser].friends.filter(f => f !== friend);
    if (users[friend]) {
        users[friend].friends = users[friend].friends.filter(f => f !== currentUser);
    }
    saveData();
    showMsg(`${friend} removed from friends`, 'success', 'friendMsg');
    loadUserData();
}

// ======== DELETE ACCOUNT ========
function deleteAccount() {
    if (!currentUser) return showMsg('No user logged in', 'error', 'friendMsg');
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    delete users[currentUser];

    for (let user in users) {
        users[user].friends = users[user].friends.filter(f => f !== currentUser);
        users[user].friendRequests = users[user].friendRequests.filter(f => f !== currentUser);
    }

    for (let chatId in chats) {
        if (chatId.includes(currentUser)) delete chats[chatId];
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.removeItem('currentUser');
    currentUser = null;

    showMsg('Account deleted successfully!', 'success', 'friendMsg');
    location.reload();
}

// ======== CHAT ========
function openChat(friend) {
    localStorage.setItem('chatFriend', friend);
    window.location.href = 'chat.html';
}

// Chat page logic
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

            if (m.sender !== currentUser) p.classList.add('friend');

            if (m.sender === currentUser) {
                const btn = document.createElement('button');
                btn.innerText = '🗑';
                btn.style.marginLeft = '10px';
                btn.style.fontSize = '12px';
                btn.onclick = () => deleteMessage(index);
                p.appendChild(btn);
            }

            chatBox.appendChild(p);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
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

    function deleteMessage(index) {
        chats[chatId].splice(index, 1);
        saveData();
        renderChat();
    }

    renderChat();

    // Auto-refresh every 1 second
    setInterval(() => {
        chats = JSON.parse(localStorage.getItem('chats') || '{}');
        renderChat();
    }, 1000);
}
