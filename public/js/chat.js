const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
//const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//const $rooms = document.querySelector('#room-details')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
//const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//const roomTemplate = document.querySelector('#room-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('command', (command) => {
    console.log(command)
    if(command.comm == "move"){
        //window.location.replace(window.location.href + "&room=Room " + command.param);
        console.log("moving to " + command.param);
        //console.log("dc")
        socket.emit("forceJoin",{ username, room: ("Room " + command.param)}, (error) => {
            if (error) {
                alert(error)
                location.href = '/'
            }
        });

    }else if(command.comm == "kill"){
        window.location.replace("https://youtu.be/dQw4w9WgXcQ");
        socket.close();
    }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log('submit')
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    console.log(message);
    var prefix = message.substr(0,5);
    console.log(prefix);
    if(prefix == "$con:"){
        var command = message.substr(5);
        console.log(command);
        socket.emit('sendCommand', command, (error) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()

            if (error) {
                return console.log(error)
            }

            console.log('Command delivered!')
        })
    }else{
        socket.emit('sendMessage', message, (error) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()

            if (error) {
                return console.log(error)
            }

            console.log('Message delivered!')
        })
    }
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

/* recycle bin
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})
*/
/*
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
*/