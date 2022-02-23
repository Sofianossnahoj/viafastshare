const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;

let roomList = [];
let peerList = [];

app.use("/static", express.static(path.resolve(__dirname, "public", "static")));

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("connected");
  socket.emit("give-id", socket.id);
  socket.on("sendArrayInfo", () => {
    socket.emit("sendRoomArray", roomList);
  });

  socket.on("room-name", (room) => {
    if (roomList.includes(room)) {
      socket.emit("alert-room", room);
    } else {
      console.log(peerList);

      roomList.push(room);
    }
  });

  socket.on("join-room", (peerObj, room) => {
    console.log("UserID", peerObj);
    if (peerList.includes(peerObj.id)) {
    } else {
      console.log("joined room: ", peerObj.id, room);

      socket.join(room);
      peerObj.room = room;
      peerList.push(peerObj);
      console.log(peerList);
      socket.emit("updateNameDisplay", peerList, room);
      socket.broadcast
        .to(room)
        .emit("user-connected", peerList, peerObj.id, room);
      socket.emit("room-display", room);
    }
  });
  socket.on("call", (room) => {
    console.log("clicked room: ", room);
    socket.emit("call-function", room, peerList);
  });

  socket.on("stop-call", (room, userId) => {
    socket.broadcast.to(room).emit("disconnect-mediaconnection", userId);
  });
  socket.on("delete-room", (room, userId) => {
    roomList = roomList.filter((roomName) => {
      return roomName !== room;
    });

    peerList = peerList.filter((peers) => {
      return peers.id === userId;
    });
    console.log("NEW PEERLISTD 2", peerList);

    console.log("removed room:", roomList);
  });

  socket.on("disconnect", () => {
    console.log(peerList);
    console.log("HE DISCONNECTED");
    console.log(peerList);
    console.log("disconnected", socket.id);
    let peerId;
    let roomName;
    for (let peer of peerList) {
      if (peer.socketId === socket.id) {
        peerId = peer.id;
        roomName = peer.room;
        break;
      }
    }
    peerList = peerList.filter((peers) => {
      return peers.id !== peerId;
    });
    console.log(peerList);
    socket.broadcast
      .to(roomName)
      .emit("user-disconnected", peerId, roomName, peerList);
  });

  console.log(peerList);

  socket.on("leave-room", (room, userId) => {
    console.log(userId, "left room");
    socket.leave(room);
    console.log("PEERLIST BEFORE", peerList);

    peerList = peerList.filter((peers) => {
      return peers.id !== userId;
    });
    console.log("PEERLIST AFTER", peerList);
    socket.broadcast.to(room).emit("user-disconnected", userId, room, peerList);
  });
});

server.listen(PORT, () => {
  console.log("server is running on", PORT);
});
