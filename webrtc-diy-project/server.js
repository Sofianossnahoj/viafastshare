const express = require("express");
const { copyFileSync } = require("fs");
const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io")(server);
const PORT = process.env.PORT || 3000;

roomList = [];
peerList = [];

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("createRoom.ejs");
});

/*
app.get("/:room", (req, res) => {
  res.render("room.ejs", { roomId: req.params.room });
});
*/
app.get("/create-room", (req, res) => {
  res.render("createRoom.ejs", res);
});

socket.on("connection", (socket) => {
  console.log("connected");
  socket.on("sendArrayInfo", () => {
    socket.emit("sendRoomArray", roomList);
  });

  socket.on("room-name", (room) => {
    roomList.push(room);
    socket.emit("addRoom", room, roomList);
  });

  socket.on("join-room", (peerObj, room) => {
    console.log("Room", room);
    console.log("UserID", peerObj);
    if (peerList.includes(peerObj.id)) {
      console.log("users is in room");
    } else {
      socket.join(room);
      peerList.push(peerObj.id);
      socket.broadcast
        .to(room)
        .emit("user-connected", peerList, peerObj.id, peerObj);
    }
  });
});

server.listen(PORT, () => {
  console.log("server is running on", PORT);
});
