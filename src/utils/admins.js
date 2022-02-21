const adminLogged = []

const addAdmin = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingAdmin = adminLogged.find((admin) => {
        return admin.room === room && admin.username === username
    })

    // Validate username
    if (existingAdmin) {
        return {
            error: 'Admin name is in use!'
        }
    }

    // Store user
    const adminUser = { id, username, room }
    adminLogged.push(adminUser)
    return { adminUser }
}

const removeAdmin = (id) => {
    const index = adminLogged.findIndex((admin) => admin.id === id)

    if (index !== -1) {
        return adminLogged.splice(index, 1)[0]
    }
}

const getAdmin = (id) => {
    return adminLogged.find((admin) => admin.id === id)
}


const getAdminAll = () => {
    return adminLogged;
}

const getAdminInRoom = (room) => {
    room = room.trim().toLowerCase()
    return adminLogged.filter((admin) => admin.room === room)
}

module.exports = {
    addAdmin,
    removeAdmin,
    getAdmin,
    getAdminInRoom,
    getAdminAll
}