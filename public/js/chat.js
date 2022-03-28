const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $fileButton = document.querySelector("#OpenImgUpload");
const $imgUpload = document.querySelector("#imgUpload");
//const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#messages");
//const $rooms = document.querySelector('#room-details')

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
//const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
//const roomTemplate = document.querySelector('#room-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("command", (command) => {
  console.log(command);
  if (command.comm == "move") {
    //window.location.replace(window.location.href + "&room=Room " + command.param);
    console.log("moving to " + command.param);
    //console.log("dc")
    socket.emit(
      "forceJoin",
      { username, room: "Room " + command.param },
      (error) => {
        if (error) {
          alert(error);
          location.href = "/";
        }
      }
    );
  } else if (command.comm == "kill") {
    window.location.replace("https://youtu.be/dQw4w9WgXcQ");
    socket.close();
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

const openDialog = () => {
  document.getElementById("imgUpload").click();
};

document.getElementById("OpenImgUpload").addEventListener("click", openDialog);

$imgUpload.onchange = () => {
  var fullPath = $imgUpload.value;
  if (fullPath) {
    var startIndex =
      fullPath.indexOf("\\") >= 0
        ? fullPath.lastIndexOf("\\")
        : fullPath.lastIndexOf("/");
    var filename = fullPath.substring(startIndex);
    if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
      filename = filename.substring(1);
    }
  }
  socket.emit("sendMessage", filename, (error) => {
    $fileButton.value = "";
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Command delivered!");
  });
};

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("submit");
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  console.log(message);
  var prefix = message.substr(0, 5);
  console.log(prefix);
  if (prefix == "$con:") {
    var command = message.substr(5);
    console.log(command);
    socket.emit("sendCommand", command, (error) => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();

      if (error) {
        return console.log(error);
      }

      console.log("Command delivered!");
    });
  } else {
    socket.emit("sendMessage", message, (error) => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();

      if (error) {
        return console.log(error);
      }

      console.log("Message delivered!");
    });
  }
});

if (!username) {
  //nothing
} else {
  socket.emit("join", { username, room }, (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  });
}
