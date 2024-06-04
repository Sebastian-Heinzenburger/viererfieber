const socket = new WebSocket("/ws");
let socket_open = false;


const copyToClipboard = str => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(str);
    return Promise.reject('The Clipboard API is not available.');
};

function clipboardInvitation(){
    let code = document.querySelector("#code_input").value;
    copyToClipboard(document.location.protocol + "//" + document.location.host + "/lobby?code="+code);
    if (document.location.protocol === "http:")
      alert("Funktioniert nur über https :c");
}

document.addEventListener("mousemove", (e) => {
    let chip = document.querySelector("#chip");
    chip.style.left = e.clientX - 50 + "px";
    chip.style.top = e.clientY - 50 + "px";
});

socket.onmessage = function (e) {
    console.log(e.data);
    let message_json = JSON.parse(e.data);
    refreshLobby(message_json);
};

socket.onopen = function () {
    createTable([[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]);
    socket_open = true;
    let obj = {};
    obj.type = "init";
    obj.code = parseInt(document.querySelector("#code_input").value);
    socket.send(JSON.stringify(obj));
    console.log("Geinited");
}

function updateName(){
    let obj = {};
    obj.type = "setName";
    obj.name = document.querySelector("#own_character_name").value;
    socket.send(JSON.stringify(obj));
}

function clickCell(column){
    let obj = {};
    obj.type = "drop";
    obj.column = column;
    socket.send(JSON.stringify(obj));
}

function refreshLobby(message_json){
    let status = document.querySelector("#status_section");
    if(!message_json.opponent_ready || !message_json.own_ready){
        status.innerText = "Warten bis alle bereit sind..."
        status.style.opacity = "0.5";
        status.style.animation = "";
    }
    else if(message_json.turn){
        status.innerText = "Du bist an der Reihe"
        status.style.opacity = "0.8";
        status.style.animation = "blink 2s step-start 0s infinite";
    }
    else{
        status.innerText = "Dein Gegner ist an der Reihe"
        status.style.opacity = "0.5";
        status.style.animation = "";
    }


    if(message_json.end || !message_json.opponent_ready || !message_json.own_ready){
        document.querySelector("#table").setAttribute("style", "filter: invert(40%) grayscale(50%)");
        if(message_json.end){
            status.innerText = message_json.turn ? "٩(＾◡＾)۶ Gewonnen " : "༼ ༎ຶ ᆺ ༎ຶ༽ Verloren";
            status.style.opacity = "1";
            status.style.animation = "blink 0.5s step-start 0s infinite";
        }
    }
    else{
        document.querySelector("#table").removeAttribute("style");
    }
    document.querySelector("#code_input").value=message_json.lobby_code;
    createTable(message_json.field);
    document.querySelector("#opponent_character_name").value=message_json.opponent_name;
    document.querySelector("#own_character_name").value=message_json.own_name;

    document.querySelector("#opponent_ready").checked = message_json.opponent_ready;

    if (message_json.own_ready && message_json.opponent_ready) {
      document.querySelector("#chip").setAttribute("visibility", (message_json.turn && !message_json.end) ? "" : "hidden");
      document.querySelector("#chip > circle:nth-child(1)").setAttribute("fill", message_json.player_no == 1 ? "blue" : "red");
    }
}

function readyForGame() {
    document.querySelector("#ready").setAttribute("disabled", "disabled");
    let obj = {};
    obj.type = "ready";
    socket.send(JSON.stringify(obj));
}

function createTable(server_field){
    let table = document.querySelector("#table");
    table.innerHTML = "";
    let maxRows = 6;
    let maxColumns = 7;
    for (let i = maxRows-1; i >= 0; i--) {
        const tr = table.insertRow();
        for (let j = 0; j < maxColumns; j++) {
            const td = tr.insertCell();
            td.setAttribute("onclick","clickCell("+j+")");
            td.setAttribute("class", "table_field");
            let color;
            switch (server_field[i][j]) {
                case 1: 
                    color = "blue";
                    break;
                case 2: 
                    color = "red";
                    break;
                default: 
                    color = "darkslateblue";
            }
            td.innerHTML = '<svg height="100" width="100" xmlns="http://www.w3.org/2000/svg"><circle r="45" cx="50" cy="50" fill="'+color+'" /></svg>';
            //   let svg = document.createElement("svg");
            //   svg.setAttribute("height", "100");
            //   svg.setAttribute("width", "100");
            //   svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
            //   let circle = document.createElement("circle");
            //   circle.setAttribute("r", 45);
            //   circle.setAttribute("fill", "blue")
            //   svg.appendChild(circle);
            // svg.innerHTML = '<circle r="45" cx="50" cy="50" fill="green" />'
            //   td.appendChild(svg);
        }
    }
}
