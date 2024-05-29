

const socket = io(); //socketio connection to server//
$(document).ready(function() {
});
socket.on("connect", () => {
console.log("connected");
      document.getElementById("header").innerHTML = "<h3>" + "Websocket Connected" + "</h3";
});

socket.on("disconnect", () => {
console.log("disconnected");
      document.getElementById("header").innerHTML = "<h3>" + "Websocket Disconnected" + "</h3>";
});

function myupdate() {
//Event sent by Client
socket.emit("my_event", function() {
});
}

// Event sent by Server//
socket.on("server", function(msg) {
      let myvar = JSON.parse(msg.data1);
      //Check if entire data is sent by server//
      if (myvar == "4") {
              document.getElementById("demo").innerHTML = "";
              document.querySelector('#checkbutton').innerText = "Submit";
              document.getElementById("checkbutton").style.cursor = "pointer";
              document.getElementById("checkbutton").disabled = false;
              document.getElementById("checkbutton").className = "btn btn-primary";

      }

      else {
              document.getElementById("demo").innerHTML += msg.data + "<br>";
              document.getElementById("checkbutton").disabled = true;
              document.getElementById("checkbutton").innerHTML = "Loading..";
              document.getElementById("checkbutton").style.cursor = "not-allowed";
              document.getElementById("checkbutton").style.pointerEvents = "auto";
      }
});



function createGame() {
    document.location.href = "/lobby";
  }

  function joinGame() {
    document.querySelector("#join_game_dialog").setAttribute("open", "open");
  }

  function focusInput(actual, next) {
    if(/[^0-9]/g.test(actual.value)){
      actual.value=actual.value.replace(/[^0-9]/g,'');
    }
    else{
      document.querySelector(next).focus();
    }
  }

  function closeDialog() {
    document.querySelector("#join_game_dialog").close()
  }

  function submitDialog(actual) {
    if(/[^0-9]/g.test(actual.value)){
      actual.value=actual.value.replace(/[^0-9]/g,'');
    }
      else{
      const dialogForm = document.querySelector('#lobbyForm');
      if (dialogForm.checkValidity())
        dialogForm.submit()
    }
  }