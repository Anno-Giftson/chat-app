// Demo storage
let users = JSON.parse(localStorage.getItem('users') || '{}');

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function signup() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Enter a username');

    if (users[username]) return alert('Username already exists');

    const code = generateCode();
    users[username] = { code: code, friends: [], friendRequests: [] };
    localStorage.setItem('users', JSON.stringify(users));
    alert(`Signup successful! Your friend code is: ${code}`);
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    if (!users[username]) return alert('User not found');
    localStorage.setItem('currentUser', username);
    alert('Logged in as ' + username);
}

function sendFriendRequest() {
    const friendCode = document.getElementById('friendCodeInput').value.trim();
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return alert('Login first');

    let found = false;
    for (let user in users) {
        if (users[user].code === friendCode) {
            users[user].friendRequests.push(currentUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Friend request sent to ' + user);
            found = true;
            break;
        }
    }
    if (!found) alert('Code not found');
}
