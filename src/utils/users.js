const users = []
const roomsOccupied = [];
const rooms = ['Tech Support 1', 'Tech Support 2','Tech Support 3', 'Tech Support 4','Cancellation/Refunding 1','Cancellation/Refunding 2', 'Cancellation/Refunding 3', 'Cancellation/Refunding 4','General Enquiries 1', 'General Enquiries 2', 'General Enquiries 3', 'General Enquiries 4', 'Sales Associate 1', 'Sales Associate 2' , 'Sales Associate 3', 'Sales Associate 4'];



const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim()
    room = room

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
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
    const user = { id, username, room }
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
    room = room.toLowerCase()
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
