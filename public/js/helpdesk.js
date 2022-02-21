const socket = io()
const messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;



socket.on('clientData', ({ users }) => {
    const html = Mustache.render(messageTemplate, {
        users
    })
     document.querySelector('#messages').innerHTML = html
})