
const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room with destructuring
const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Join chatroom
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scrolling
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Event listener for message submission
chatform.addEventListener('submit', (e) => {
    e.preventDefault();
    //get message text
    const msg = e.target.elements.msg.value;

    console.log(msg);

    //emit message to server
    socket.emit('chatMessage', msg);

    //Clearing message box
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

    
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
//Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}
//Add users names to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<Li>${user.username}<Li/>`).join('')}
    `;
}