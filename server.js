const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let users = {}; // { username: { code, friends: [], friendRequests: [] } }
let chats = {}; // { chatId: [{ sender, text, timestamp }] }

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Sign up
app.post('/signup', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).send('Username required');
    if (users[username]) return res.status(400).send('Username exists');
    const code = generateCode();
    users[username] = { code, friends: [], friendRequests: [] };
    res.json({ code });
});

// Get user info
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    if (!users[username]) return res.status(404).send('User not found');
    res.json(users[username]);
});

// Send friend request
app.post('/friend-request', (req, res) => {
    const { fromUser, code } = req.body;
    let targetUser = null;
    for (let user in users) if (users[user].code === code) targetUser = user;
    if (!targetUser) return res.status(404).send('Code not found');
    if (users[targetUser].friendRequests.includes(fromUser)) return res.status(400).send('Already requested');
    users[targetUser].friendRequests.push(fromUser);
    res.send('Friend request sent');
});

// Accept friend request
app.post('/accept-friend', (req, res) => {
    const { username, friend } = req.body;
    if (!users[username] || !users[friend]) return res.status(404).send('User not found');
    // Add each other as friends
    users[username].friends.push(friend);
    users[friend].friends.push(username);
    // Remove friend request
    users[username].friendRequests = users[username].friendRequests.filter(f => f !== friend);
    res.send('Friend added');
});

// Chat socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-chat', ({ chatId }) => {
        socket.join(chatId);
        if (!chats[chatId]) chats[chatId] = [];
        socket.emit('chat-history', chats[chatId]);
    });

    socket.on('send-message', ({ chatId, sender, text }) => {
        const message = { sender, text, timestamp: new Date() };
        if (!chats[chatId]) chats[chatId] = [];
        chats[chatId].push(message);
        io.to(chatId).emit('new-message', message);
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
