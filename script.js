const API = 'http://localhost:3000';
let currentUser = null;

async function signup() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Enter username');
    const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (res.ok) document.getElementById('signupCode').innerText = `Your code: ${data.code}`;
    else alert(data);
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    if (!username) return alert('Enter username');
    const res = await fetch(`${API}/user/${username}`);
    if (!res.ok) return alert('User not found');
    currentUser = username;
    document.getElementById('friendSection').style.display = 'block';
    loadUserData();
}

async function loadUserData() {
    const res = await fetch(`${API}/user/${currentUser}`);
    const data = await res.json();

    // Friend requests
    const frList = document.getElementById('friendRequests');
    frList.innerHTML = '';
    data.friendRequests.forEach(f => {
        const li = document.createElement('li');
        li.innerText = f;
        const btn = document.createElement('button');
        btn.innerText = 'Accept';
        btn.onclick = () => acceptFriend(f);
        li.appendChild(btn);
        frList.appendChild(li);
    });

    // Friends
    const fList = document.getElementById('friendsList');
    fList.innerHTML = '';
    data.friends.forEach(f => {
        const li = document.createElement('li');
        li.innerText = f;
        const btn = document.createElement('button');
        btn.innerText = 'Chat';
        btn.onclick = () => openChat(f);
        li.appendChild(btn);
        fList.appendChild(li);
    });
}

async function sendFriendRequest() {
    const code = document.getElementById('friendCodeInput').value.trim();
    const res = await fetch(`${API}/friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUser: currentUser, code })
    });
    if (res.ok) alert('Friend request sent');
    else alert(await res.text());
}

async function acceptFriend(friend) {
    const res = await fetch(`${API}/accept-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, friend })
    });
    if (res.ok) loadUserData();
}

function openChat(friend) {
    localStorage.setItem('chatFriend', friend);
    window.location.href = 'chat.html';
}
