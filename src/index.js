const path = require("path");



// HTTPS CONFIG  
var fs = require('fs');
var http = require('http');
var http_port    =   process.env.PORT || 8080; 
var https = require('https');
var https_port    =   process.env.PORT_HTTPS || 3000; 
const port = process.env.PORT || 3000;
var privateKey  = fs.readFileSync(path.resolve('key.pem'));
var certificate = fs.readFileSync(path.resolve('cert.pem'));

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();
app.enable('trust proxy')

// your express configuration here
var httpsServer = https.createServer(credentials, app);


//HTTP 
// Redirect from http port to https
http.createServer(function (req, res) {
   res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(http_port,port) + req.url });
   console.log("http request, will go to >> ");
   console.log("https://" + req.headers['host'].replace(http_port,port) + req.url );
   res.end();
}).listen(http_port)

// Some Session Code that may prove useful 
const uuid = require("uuid");
const session_cookie = require('cookie-session');
/*
app.use(
  session_cookie({
    name: 'session',
    keys: ['key1','key2'],
    secret: "some secret",
    httpOnly: true,  // Don't let browser javascript access cookies.
    secure: true, // Only use cookies over https.
    maxAge: 120 * 1000 //expires in 120 seconds
  })
);*/

//temporary volatile storage for cookies
const sessions = new Map();



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
const Session = require("./utils/Sessions.js");
const MongoClient = require("mongodb").MongoClient;
//const app = express();
//const server = http.createServer(app);
const socketio = require("socket.io");

const io = socketio(httpsServer);
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(publicDirectoryPath));
app.use(cookieparser());

const crypto = require('crypto');
const inspector = require("inspector");
const { cookie } = require("express/lib/response");
  



// variables
const rooms = ["Room 1", "Room 2", "Room 3", "Room 4"];
const commandsList = ["move","boot","kill"];
var room1_occupied = false;
var room2_occupied = false;
var room3_occupied = false;
var room4_occupied = false;
var foundAdmin = false;
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
    
    app.post("/clientData", (req, res) => {
      console.log("clientform is called!!");
      console.log(req.body);
      return res.redirect("/chat");
    });



    app.post("/adminLogin", (req, res) => {
      console.log("admin login page for credentials!!");
      
      /*
      console.log(
        "These are the credentials requested by the admin --> ",
        req.body
      );
      */

      // hash stuff here SHA 256
      var hashPwd = crypto.createHash('sha256').update(req.body.password).digest('hex');
      console.log(
        "These are the credentials requested by the admin --> username: " + req.body.username + " password: " + hashPwd
      );
      
      var username = req.body.username;

      var query = {username: req.body.username, password: hashPwd};
      var cursor = db.collection("credentials").find(query); 

      cursor.toArray(function (err, results) {
        //for (let i = 0; i < results.length; i++) {
          if (
            results.length >0 
          ) {
            // no room filed needed here
            foundAdmin = true;
            console.log("this is the value of the found now --> ", results);
            console.log("the admin is fully authenticated!!");

            if (req.body.room == "Room 1") {
              room1_occupied = true;
            }
            if (req.body.room == "Room 2") {
              room2_occupied = true;
            }
            if (req.body.room == "Room 3") {
              room3_occupied = true;
            }
            if (req.body.room == "Room 4") {
              room4_occupied = true;
            }

            admin_join = true;
            console.log(req.body.room);

            //addAdmin({id: results['id'], username: results['username'], room: req.body.room});

            //issue session token here
            
            const now = new Date();
            const expiresAt = new Date(now + 360 * 1000);
            const token = uuid.v4();
            const session = new Session(username, token, true, expiresAt);
            res.cookie("session_token", token, {exipres: expiresAt, secure: true, httpOnly: true});
            sessions.set(token, session);
            console.log("valied tokens -->", sessions.size);

            return res.redirect(
              "/chat.html?username=" +
                `${req.body.username}&room=${req.body.room}`
            );
          }else{
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

app.post("/joinForm", (req, res) => {
  console.log("joinForm is called!!");
  console.log(req.body);

  if (req.body.category === "Client Login") {
      return res.redirect("/clientform");
  }
  if (req.body.category === "Admin Login") {
      return res.redirect("/adminform");
  }
});

app.post("/clientJoin", (req, res) => {
  console.log("clientform is called!!");
  console.log(req.body);

  const username = req.body.username;
  //issue a token
  const now = new Date();
  const expiresAt = new Date(now + 360 * 1000);
  const token = uuid.v4();
  const session = new Session(username, token, false, expiresAt);
  res.cookie("session_token", token, {exipres: expiresAt, secure: true, httpOnly: true});
  sessions.set(token, session);
  return res.redirect(`/chat.html?username=${username}`);
});

app.get("/clientform", (req, res) => {
  console.log("client join");
  if(!req.cookies || !req.cookies["session_token"]){
    return res.redirect("/clientform.html");
  }else{
    console.log("cookies -> ", req.cookies["session_token"])
    const ses_cookie = sessions.get(req.cookies["session_token"]);
    if(!ses_cookie){
      return res.redirect("/clientform.html");
    }else if(ses_cookie.isExpired() ){
      sessions.delete(req.cookies["session_token"]);
      return res.redirect("/clientform.html");
    }
    return res.redirect(`/chat.html?username=${ses_cookie.username}`);
  }
});

app.get("/adminform", (req, res) => {
  console.log("admin join");
  if(!req.cookies || !req.cookies["session_token"]){
    return res.redirect("/adminform.html");
  }else{
    console.log("cookies -> ", req.cookies["session_token"])
    const ses_cookie = sessions.get(req.cookies["session_token"]);
    if(!ses_cookie || !ses_cookie.admin){
      return res.redirect("/adminform.html");
    }else if(ses_cookie.isExpired() ){
      sessions.delete(req.cookies["session_token"]);
      return res.redirect("/adminform.html");
    }
    foundAdmin = true;
    admin_join = true;
    return res.redirect(`/adminform2.html?username=${ses_cookie.username}`);
  }
});

app.post("/adminjoin2", (req,res) => {
  console.log("adminjoin part 2");
  if(!req.cookies || !req.cookies["session_token"]){
    return res.redirect("/adminform.html");
  }else{
    console.log("cookies -> ", req.cookies["session_token"])
    const ses_cookie = sessions.get(req.cookies["session_token"]);
    if(!ses_cookie || !ses_cookie.admin){
      return res.redirect("/adminform.html");
    }else if(ses_cookie.isExpired() ){
      sessions.delete(req.cookies["session_token"]);
      return res.redirect("/adminform.html");
    }
    foundAdmin = true;
    admin_join = true;
    return res.redirect(`/chat.html?username=${req.body.username}&room=${req.body.room}`);
  }
});

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

    if (foundAdmin & !admin_join) {
      // if an admin is logged in
      // chnage user room to admin room

      // if an admin is with another user in a room then assign a new room to user
      if (!user_occupied_room_1 && room1_occupied) {
        // assign room 1 to user
        assigned_room = "Room 1";
        user_occupied_room_1 = true;
      } else if (!user_occupied_room_2 && room2_occupied) {
        assigned_room = "Room 2";
        user_occupied_room_2 = true;
      } else if (!user_occupied_room_3 && room3_occupied) {
        assigned_room = "Room 3";
        user_occupied_room_3 = true;
      } else if (!user_occupied_room_4 && room4_occupied) {
        assigned_room = "Room 4";
        user_occupied_room_4 = true;
      }
    } else {
      // user is assigned to non occupied room
      if (!admin_join) {
        assigned_room = "Room 1";
        if (!user_occupied_room_1) {
          // assign room 1 to user
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
      }
    }

    //assign room
     if(admin_join){
    //   if (!user_occupied_room_1) {
    //     assigned_room = "Room 1";
    //     user_occupied_room_1 = true;
    //   } else if (!user_occupied_room_2) {
    //     assigned_room = "Room 2";
    //     user_occupied_room_2 = true;
    //   } else if (!user_occupied_room_3) {
    //     assigned_room = "Room 3";
    //     user_occupied_room_3 = true;
    //   } else if (!user_occupied_room_4) {
    //     assigned_room = "Room 4";
    //     user_occupied_room_4 = true;
    //   }
      
    //   user.room = assigned_room
    // }else{
      //admin room asssign is handled elsewhere
      console.log("admin_join");
      user.admin = true;
      admin_join = false;
    } else {
      user.room = assigned_room;
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
    if(!user){

    }else{
      io.to(user.room).emit("message", generateMessage(user.username, message));
    }
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