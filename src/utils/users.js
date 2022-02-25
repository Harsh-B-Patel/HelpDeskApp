const roomsOccupied = [];
const rooms = ['Room 1', 'Room 2','Room 3', 'Room 4'];
var users = []
var admin = []


const addUser = ({ id, username, room, admin }) => {
    // Clean the data
    username = username.trim()
    //room = room

    // Validate the data
    if (!username) {
        return {
            error: 'Username required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room, admin }
    users.push(user)
    roomsOccupied.push(room)
    console.log("add function is called!");
   // console.log("these are rooms currently occupied --> " , roomsOccupied);
  //  roomsAvailble();
    return { user }
}




const roomsAvailble = () => {
    var roomsNotOccupied = [];
    for(var i=0;i < rooms.length; i++)
    {
        if (roomsOccupied.indexOf(rooms[i]) === -1)
        {
            roomsNotOccupied.push(rooms[i]);
        }
    }
    return roomsNotOccupied;

}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}


const getUserAll = () => {
    return users;
}


const getUsersInRoom = (room) => {
    room = room
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getUserAll,
    roomsAvailble
}
