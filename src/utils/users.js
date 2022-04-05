var roomsOccupied = [];

const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4'];
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
    console.log("add function is called!");
    //roomsAvailble();
    return { user }
}




const roomsAvailable = () => {
    //update+return the roomsoccupied arrray
    let roomsOccupied = [false, false, false, false];
    for (let user in users) {
        if (users[user].admin) {
            //console.log("admin left");
        } else if (users[user].room == 'Room 1') {
            roomsOccupied[0] = true;
        } else if (users[user].room == 'Room 2') {
            roomsOccupied[1] = true;
        } else if (users[user].room == 'Room 3') {
            roomsOccupied[2] = true;
        } else if (users[user].room == 'Room 4') {
            roomsOccupied[3] = true;
        }
    }
    //console.log(roomsOccupied)
    return roomsOccupied;
}

const adminsAvailable = () => {
    //update+return the roomsoccupied arrray
    let adminOccupied = [false, false, false, false];
    for (let user in users) {
        if (users[user].admin) {
            if (users[user].room == 'Room 1') {
                adminOccupied[0] = true;
            } else if (users[user].room == 'Room 2') {
                adminOccupied[1] = true;
            } else if (users[user].room == 'Room 3') {
                adminOccupied[2] = true;
            } else if (users[user].room == 'Room 4') {
                adminOccupied[3] = true;
            }
        }
    }
    //console.log(roomsOccupied)
    return adminOccupied;
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
    roomsAvailable,
    adminsAvailable
}
