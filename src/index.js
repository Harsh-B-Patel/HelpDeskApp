const path = require("path");
//const http = require("http");
//const express = require("express");


// HTTP/ HTTPS CONFIG - HTTP is commented out rn 
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync(path.resolve('key.pem'));
var certificate = fs.readFileSync(path.resolve('cert.pem'));

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();
app.enable('trust proxy')

// your express configuration here

//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//httpServer.listen(3000);
//httpsServer.listen(3000);


/*
// Some Session Code that may prove useful 
const session = require('cookie-session');
app.use(
  session({
    secret: "some secret",
    httpOnly: true,  // Don't let browser javascript access cookies.
    secure: true, // Only use cookies over https.
  })
);

*/


const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getUserAll,
  roomsAvailable,
} = require("./utils/users");
const {
  addAdmin,
  removeAdmin,
  getAdmin,
  getAdminInRoom,
  getAdminAll
} = require("./utils/admins");
const MongoClient = require("mongodb").MongoClient;
//const app = express();
//const server = http.createServer(app);
const socketio = require("socket.io");

const io = socketio(httpsServer);
const bodyparser = require("body-parser");
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(publicDirectoryPath));





// variables
const rooms = ["Room 1", "Room 2", "Room 3", "Room 4"];
const commandsList = ["move","boot","kill"];
var room1_occupied = false;
var room2_occupied = false;
var room3_occupied = false;
var room4_occupied = false;
//var foundAdmin = false;
var admin_join = false;
var user_occupied_room_1 = false;
var user_occupied_room_2 = false;
var user_occupied_room_3 = false;
var user_occupied_room_4 = false;
// No Sql is very diffrent from SQL, NO SQL IS COLLECTIONS WHILE SQL is TAbles

MongoClient.connect(
  "mongodb+srv://test:test4481@cluster0.rnp32.mongodb.net/helpdeskdb?retryWrites=true&w=majority",
  (err, client) => {
    // This works
    // .. Start the server
    if (err) {
      return console.log(err);
    }

    // Change db to  database
    console.log("the database connection is successful!!");
    db = client.db("helpdeskdb"); // helpdesk here is: Databse name with credentaisl collection, it also set by default above

    app.post("/joinForm", (req, res) => {
      console.log("joinForm is called!!");
      console.log(req.body);
      if (req.body.category === "Client Login") {
        return res.redirect("/clientform.html");
      }
      if (req.body.category === "Admin Login") {
        return res.redirect("/adminform.html");
      }
    });

    app.post("/clientData", (req, res) => {
      console.log("clientform is called!!");
      console.log(req.body);
      return res.redirect("/chat.html");
    });

    app.post("/adminLogin", (req, res) => {
      console.log("admin login page for credentials!!");
      console.log(
        "These are the credentials requested by the admin --> ",
        req.body
      );

      var query = {username: req.body.username, password: req.body.password};
      var cursor = db.collection("credentials").find(query); 

      cursor.toArray(function (err, results) {
        //for (let i = 0; i < results.length; i++) {
          if (
            results.length >0 
          ) {
            // no room filed needed here
            //foundAdmin = true;
            console.log("this is the value of the found now --> ", results);
            console.log("the admin is fully authenticated!!");

            admin_join = true;
            console.log(req.body.room);

            //addAdmin({id: results['id'], username: results['username'], room: req.body.room});

            return res.redirect(
              "/chat.html?username=" +
                `${req.body.username}&room=${req.body.room}`
            );
          }else{
        //}
        return res.redirect("/unauthenticated.html");
        }
      });
    });

    app.post("/credentials", (req, res) => {
      console.log("helpdesk user awaits for credentials!!");
      console.log(
        "These are the credentials requested by the user --> ",
        req.body
      );
      var cursor = db.collection("credentials").find(); // check for username in credentials
      var found = false;

      cursor.toArray(function (err, results) {
        for (let i = 0; i < results.length; i++) {
          console.log(" --- > ", results[i]);
          if (req.body.username === results[i].username) {
            found = true;
            console.log("this is a valid user");
            return res.redirect("/helpdesk.html");
          }
        }
      });
    });
  }
);

io.on("connection", (socket) => {
  console.log("New WebSocket index.js connection");
  //socket.emit('message', "Welcome from the server!!");
  socket.emit("clientData", {
    users: getUserAll(),
  });

  socket.on("forceJoin", (options, callback) => {
    const user = getUser(socket.id);

    console.log(`movign user ${user.name} to room ${options.room}`)
    //update user room
    user.room = options.room;
    //update room statuses
    let rooms = roomsAvailable();
      user_occupied_room_1 = rooms[0];
      user_occupied_room_2 = rooms[1];
      user_occupied_room_3 = rooms[2];
      user_occupied_room_4 = rooms[3];
    console.log(user_occupied_room_1, user_occupied_room_2, user_occupied_room_3, user_occupied_room_4);
    //reconnect user to new room
    socket.join(user.room);
    //console.log(user.room);
    console.log(user);
    


    socket.emit("message", generateMessage("System", `Welcome ${user.username}!`));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, admin: false, ...options });
    var assigned_room = "Waiting Room";

    if (error) {
      return callback(error);
    }

    //assign room
    if(!admin_join){
      if (!user_occupied_room_1) {
        assigned_room = "Room 1";
        user_occupied_room_1 = true;
      } else if (!user_occupied_room_2) {
        assigned_room = "Room 2";
        user_occupied_room_2 = true;
      } else if (!user_occupied_room_3) {
        assigned_room = "Room 3";
        user_occupied_room_3 = true;
      } else if (!user_occupied_room_4) {
        assigned_room = "Room 4";
        user_occupied_room_4 = true;
      }
      
      user.room = assigned_room
    }else{
      //admin room asssign is handled elsewhere
      console.log("admin_join");
      user.admin = true;
      admin_join = false;
    }

    socket.join(user.room);
    //console.log(user.room);
    console.log(user);

    socket.emit("message", generateMessage("System", `Welcome ${user.username}!`));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendCommand", (command, callback) => {
    //const admin = getAdmin(socket.id);
    const admin = getUser(socket.id);
    if(!admin.admin){
      console.log(`User ${admin} attempted to use command: ${command}`);
      socket.emit("message", generateMessage("System", `Users cannot use commands! This incident will be reported.`));
    }else{
      console.log('command means thing happens --------------------');
      //parse command
      var temp = command.trim().split(" ");
      var parsedCommand;
      if(commandsList.includes(temp[0])){
        parsedCommand = {comm: temp[0], param: temp[1]};
      }else{
        parsedCommand = {comm: 'bad', param: null};
      }
      console.log(parsedCommand)
      socket.broadcast.to(admin.room).emit("command", parsedCommand);
    }
    callback();
    
  });


  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {

      let rooms = roomsAvailable();
        user_occupied_room_1 = rooms[0];
        user_occupied_room_2 = rooms[1];
        user_occupied_room_3 = rooms[2];
        user_occupied_room_4 = rooms[3];


      io.to(user.room).emit(
        "message",
        generateMessage("System", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }

    console.log(user_occupied_room_1, user_occupied_room_2, user_occupied_room_3, user_occupied_room_4);
  });
});

httpsServer.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});