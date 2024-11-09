const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const modName = "Class Moderator";

//Run when client connects
io.on("connection", socket => {
  //User joins room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //welcomes current user
    socket.emit("message", formatMessage(modName, `Welcome to ${user.room}, ${user.username}`));

    //Broadcast when user connects
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(modName, `${user.username} has joined the Class`)
    );

    //Send user and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //catching emitted message from main.js
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Broadcast when user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(modName, `${user.username} has left the Class`));

      //Send user and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
    }
    
  });
});

//set public folder to be static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log("Server is now running on port ${PORT}"));
