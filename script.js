let users = JSON.parse(localStorage.getItem("users") || "{}")
let chats = JSON.parse(localStorage.getItem("chats") || "{}")
let currentUser = localStorage.getItem("currentUser")

function save(){
localStorage.setItem("users",JSON.stringify(users))
localStorage.setItem("chats",JSON.stringify(chats))
}

function showMsg(id,msg,color="red"){
let el=document.getElementById(id)
if(!el) return
el.innerText=msg
el.style.color=color
setTimeout(()=>el.innerText="",4000)
}

function generateCode(){
return Math.random().toString(36).substring(2,8).toUpperCase()
}

function signup(){

let u=document.getElementById("signupUser").value.trim()
let p=document.getElementById("signupPass").value.trim()

if(!u || !p){
showMsg("signupMsg","Fill all fields")
return
}

if(users[u]){
showMsg("signupMsg","Username already exists")
return
}

let code = generateCode()

users[u] = {
password:p,
code:code,
friends:[],
requests:[]
}

save()

showMsg("signupMsg","Account created!","green")

document.getElementById("signupBox").style.display="none"
}

function login(){

let u=document.getElementById("loginUser").value.trim()
let p=document.getElementById("loginPass").value.trim()

if(!users[u]){
showMsg("loginMsg","User not found")
return
}

if(users[u].password !== p){
showMsg("loginMsg","Wrong password")
return
}

currentUser=u
localStorage.setItem("currentUser",u)

openMain()
}

function forgotPassword(){

let u=prompt("Enter your username")

if(!users[u]){
alert("User not found")
return
}

alert("Your password is: "+users[u].password)
}

function logout(){

localStorage.removeItem("currentUser")
location.href="index.html"

}

function openMain(){

if(!document.getElementById("mainUI")) return

document.getElementById("signupBox").style.display="none"
document.getElementById("loginBox").style.display="none"
document.getElementById("mainUI").style.display="block"

document.getElementById("welcomeText").innerText="Logged in as "+currentUser
document.getElementById("myCode").innerText=users[currentUser].code

loadFriends()
}

function sendFriendRequest(){

let code=document.getElementById("friendCodeInput").value.trim()

let target=null

for(let u in users){
if(users[u].code === code){
target=u
break
}
}

if(!target){
showMsg("friendMsg","Code not found")
return
}

if(target === currentUser){
showMsg("friendMsg","You cannot add yourself")
return
}

if(users[currentUser].friends.includes(target)){
showMsg("friendMsg","Already friends")
return
}

users[target].requests.push(currentUser)

save()

showMsg("friendMsg","Friend request sent","green")
}

function loadFriends(){

let req=document.getElementById("requestsList")
let fr=document.getElementById("friendsList")

if(!req || !fr) return

req.innerHTML=""
fr.innerHTML=""

users[currentUser].requests.forEach(r=>{

let li=document.createElement("li")
li.innerText=r

let b=document.createElement("button")
b.innerText="Accept"

b.onclick=()=>acceptFriend(r)

li.appendChild(b)
req.appendChild(li)

})

users[currentUser].friends.forEach(f=>{

let li=document.createElement("li")
li.innerText=f

let chat=document.createElement("button")
chat.innerText="Chat"
chat.onclick=()=>openChat(f)

let del=document.createElement("button")
del.innerText="Delete"
del.onclick=()=>deleteFriend(f)

li.appendChild(chat)
li.appendChild(del)

fr.appendChild(li)

})
}

function acceptFriend(friend){

users[currentUser].friends.push(friend)
users[friend].friends.push(currentUser)

users[currentUser].requests =
users[currentUser].requests.filter(x=>x!==friend)

save()

loadFriends()
}

function deleteFriend(friend){

users[currentUser].friends =
users[currentUser].friends.filter(f=>f!==friend)

users[friend].friends =
users[friend].friends.filter(f=>f!==currentUser)

save()

loadFriends()
}

function openChat(friend){

localStorage.setItem("chatFriend",friend)
window.location="chat.html"

}

function goBack(){
window.location="index.html"
}

if(window.location.pathname.endsWith("chat.html")){

let friend = localStorage.getItem("chatFriend")
currentUser = localStorage.getItem("currentUser")

document.getElementById("chatFriendName").innerText = friend

let box=document.getElementById("chatBox")

let chatId=[currentUser,friend].sort().join("_")

if(!chats[chatId]) chats[chatId]=[]

function render(){

box.innerHTML=""

chats[chatId].forEach((m,i)=>{

let div=document.createElement("div")

div.className="bubble"

if(m.sender === currentUser){
div.classList.add("me")
}

div.innerText = m.sender + ": " + m.text

if(m.sender === currentUser){

let del=document.createElement("button")
del.innerText="🗑"

del.onclick=()=>{
chats[chatId].splice(i,1)
save()
render()
}

div.appendChild(del)

}

box.appendChild(div)

})

box.scrollTop = box.scrollHeight
}

window.sendMessage=function(){

let input=document.getElementById("messageInput")

let text=input.value.trim()

if(!text) return

chats[chatId].push({
sender:currentUser,
text:text
})

save()

input.value=""

render()

}

render()

setInterval(()=>{

chats = JSON.parse(localStorage.getItem("chats") || "{}")
render()

},1000)

}

if(currentUser){
openMain()
}

function deleteAccount(){
    if(!currentUser) return showMsg("friendMsg","No user logged in");

    if(!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    // Remove user from other users' friends & requests
    for(let u in users){
        users[u].friends = users[u].friends.filter(f => f !== currentUser);
        users[u].requests = users[u].requests.filter(r => r !== currentUser);
    }

    // Remove user’s chats
    for(let chatId in chats){
        if(chatId.includes(currentUser)) delete chats[chatId];
    }

    // Delete user
    delete users[currentUser];
    save();

    localStorage.removeItem("currentUser");
    currentUser = null;

    alert("Account deleted!");
    location.reload();
}
