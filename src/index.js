const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom , getUserAll , roomsAvailble} = require('./utils/users')
const MongoClient = require('mongodb').MongoClient;
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const bodyparser = require('body-parser');
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(publicDirectoryPath))


// variables
const rooms = ['Room 1', 'Room 2','Room 3', 'Room 4'];
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

MongoClient.connect('mongodb+srv://test:test4481@cluster0.rnp32.mongodb.net/helpdeskdb?retryWrites=true&w=majority', (err, client)=> {
  // This works
    // .. Start the server
    if (err)
    {
        return console.log(err);
    }

    // Change db to  database
        console.log("the database connection is successful!!");
         db = client.db('helpdeskdb'); // helpdesk here is: Databse name with credentaisl collection, it also set by default above



    app.post('/joinForm', (req,res) => {
        console.log("joinForm is called!!");
        console.log(req.body);
        if(req.body.category === "Client Login")
        {
            return res.redirect('/clientform.html');
        }
        // Dont need helpdesk dashboard
        if(req.body.category === "Helpdesk Dashboard")
        {
            return res.redirect('/helpdeskform.html')
        }
        if(req.body.category === "Admin Login")
        {
            return res.redirect('/adminform.html')
        }

    })


    app.post('/clientData', (req,res) => {
        console.log("clientform is called!!");
        console.log(req.body);
        return res.redirect('/chat.html');
    })



    app.post('/adminLogin', (req,res) => {
        console.log("Admin Login Page");
        console.log("Credentials Entered --> " ,req.body);
        var cursor = db.collection('credentials').find();  // collection name credentials {JSon like objects here username, passowrd , room }


        cursor.toArray(function(err, results)
        {
            for(let i=0;i< results.length ; i++)
            {
              console.log(results[i].username + " "+ results[i].password);
                if(req.body.username === results[i].username && req.body.password === results[i].password) // no room filed needed here
                {
                    foundAdmin = true;
                    console.log("this is the value of the found now --> " , foundAdmin);
                    console.log("the admin is fully authenticated!!");
                    // redirects to room selected
                    // Check room booleans here

                    // admin has room selection previledge
                    // upon selcting a room it becomes occupied by that admin,
                    // 2 admins can select the same room
                    if(req.body.room == "Room 1"){
                      room1_occupied = true;
                    }
                    if(req.body.room == "Room 2"){
                      room2_occupied = true;
                    }
                    if(req.body.room == "Room 3"){
                      room3_occupied = true;
                    }
                    if(req.body.room == "Room 4"){
                      room4_occupied = true;
                    }
                    admin_join = true;
                    console.log(req.body.room);
                    return res.redirect('/chat.html?username=' + `${req.body.username}&room=${req.body.room}` );
                }
            }
            console.log("Invalid Credentials: Authentication Failed");
            return res.redirect('/unauthenticated.html');

        })
    })



    app.post('/credentials', (req,res) => {
        console.log("helpdesk user awaits for credentials!!");
        console.log("These are the credentials requested by the user --> " ,req.body);
        var cursor = db.collection('credentials').find();   // check for username in credentials
        var found = false;

        cursor.toArray(function(err, results)
        {
            for(let i=0;i< results.length ; i++)
            {
                console.log(" --- > " , results[i]);
                if(req.body.username === results[i].username)
                {
                    found = true;
                    console.log("this is a valid user");
                    return res.redirect('/helpdesk.html');
                }

            }
        })


    })




})

io.on('connection', (socket) => {
    console.log('New WebSocket index.js connection')
    //socket.emit('message', "Welcome from the server!!");

    socket.emit('clientData', {
        users: getUserAll()
    });




    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        var assigned_room = "Room 1";
        //const rooms = ['Room 1', 'Room 2','Room 3', 'Room 4'];

        if (error) {
            return callback(error)
        }

        // takes user to room selected in clientform.html
        // lets automate this too a room with helpdesk personel or else a random room
        // If we can send user to helpdesk user's room that would be great
        // USE ROOM OCCUPIED BOOLEANS CREATED ABOVE ADMIN_LOGIN HERE TO DETERMINE USER ROOM
        if (foundAdmin & !admin_join){
          // if an admin is logged in
          // chnage user room to admin room

          // if an admin is with another user in a room then assign a new room to user
          if (!user_occupied_room_1){
            // assign room 1 to user
            assigned_room = "Room 1";
            user_occupied_room_1 = true;

          }else if(!user_occupied_room_2) {
            assigned_room = "Room 2";
            user_occupied_room_2 = true;

          }else if(!user_occupied_room_3) {
            assigned_room = "Room 3";
            user_occupied_room_3 = true;

          }else if(!user_occupied_room_4) {
            assigned_room = "Room 4";
            user_occupied_room_4 = true;

          }


        }else{
          // user is assigned to non occupied room
          if (!admin_join){
            assigned_room = "Room 1";
            if (!user_occupied_room_1){
              // assign room 1 to user
              assigned_room = "Room 1";
              user_occupied_room_1 = true;

            }else if(!user_occupied_room_2) {
              assigned_room = "Room 2";
              user_occupied_room_2 = true;

            }else if(!user_occupied_room_3) {
              assigned_room = "Room 3";
              user_occupied_room_3 = true;

            }else if(!user_occupied_room_4) {
              assigned_room = "Room 4";
              user_occupied_room_4 = true;

            }
          }
        }

        if (admin_join){
          admin_join = false;
        }else{
          user.room = assigned_room;
        }

        socket.join(user.room)
        console.log(user.room);

        socket.emit('message', generateMessage('', 'Welcome everyone!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    //var roomObj = {"rooms" : roomsAvailble()}
    //socket.emit('roomsAvailable', roomObj );




    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Listening on localhost:${port}`);})
