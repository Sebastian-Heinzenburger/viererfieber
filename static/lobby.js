const socket = new WebSocket("/ws");
let socket_open = false;

//{"end":false,"own_name":"Bobby","field":[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]],"opponent_name":"Alice","own_ready":true,"opponent_ready": false,"turn":true}
socket.onmessage = function (e) {
    message_json = JSON.parse(e.data);
    if(message_json.type == "Lobby"){
        refreshLobby(message_json);
    }
};

socket.onopen = function (e) {
    socket_open = true;
    obj = {};
    obj.type = "init";
    obj.code = document.querySelector("#table").style.filter = "invert(40%) grayscale(50%);";
    socket.send(JSON.stringify(obj));
}

function refreshLobby(message_json){
    if(message_json.end || !message_json.opponent_ready || !message_json.own_ready){
        document.querySelector("#board").style.filter = "invert(40%) grayscale(50%);";
        if(message_json.end){
        document.querySelector("#join_game_dialog").showModal();
            document.querySelector("#message").innerText = message_json.turn ? "gewonnen." : "verloren.";
            document.querySelector("#join_game_dialog").showModal();
        }
    }
    else{
        document.querySelector("#board").style.filter = "";
    }
    document.querySelector("#code_input").value=message_json.lobby_code;
    createTable(message_json.field);
    if(message_json.enemy_player != ""){
        document.querySelector("#opponent_character_name").value=message_json.enemy_player;
    }
    document.querySelector("#opponent_ready").checked = message_json.opponent_ready;

}

function readyForGame() {
    //namen auslesen
    const nameInput = document.querySelector("#name");
    nameInput.setAttribute("disabled", "disabled");

    console.debug(nameInput.value);
}
createTable([[0,0,0,0,0,0,0],[0,0,0,1,0,0,0],[0,0,0,2,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,2,0]]);
function createTable(board){
    let table = document.querySelector("#board");
    for (let i = 0; i < 6; i++) {
        const tr = table.insertRow();
        for (let j = 0; j < 7; j++) {
            const td = tr.insertCell();
            td.setAttribute("onclick","clickCell("+i+")");
            td.setAttribute("class", "table_field");
            let color;
            switch (board[i][j]) {
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

