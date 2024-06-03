const socket = new WebSocket("/ws");
let socket_open = false;

code = document.querySelector("#code_input").value.split('');
document.querySelector("#invite_link").setAttribute("href","http://192.168.178.67:3001/lobby?num0="+code[0]+"&num1="+code[1]+"&num2="+code[2]+"&num3="+code[3]);


//{"end":false,"own_name":"Bobby","field":[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]],"opponent_name":"Alice","own_ready":true,"opponent_ready": false,"turn":true}
socket.onmessage = function (e) {
    console.log(e.data);
    let message_json = JSON.parse(e.data);
    refreshLobby(message_json);
};

socket.onopen = function (e) {
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
    if(message_json.end || !message_json.opponent_ready || !message_json.own_ready){
        document.querySelector("#table").setAttribute("style", "filter: invert(40%) grayscale(50%)");

        if(message_json.end){
        document.querySelector("#join_game_dialog").showModal();
            document.querySelector("#message").innerText = message_json.turn ? "gewonnen." : "verloren.";
            document.querySelector("#join_game_dialog").showModal();
        }
    }
    else{
        document.querySelector("#table").removeAttribute("style");
    }
    document.querySelector("#code_input").value=message_json.lobby_code;
    createTable(message_json.field);
    if(message_json.opponent_name != ""){
        document.querySelector("#opponent_character_name").value=message_json.opponent_name;
    }
    document.querySelector("#opponent_ready").checked = message_json.opponent_ready;

}

function readyForGame() {
    document.querySelector("#own_character_name").setAttribute("disabled", "disabled");
    document.querySelector("#ready").setAttribute("disabled", "disabled");
}

function createTable(server_field){
    let table = document.querySelector("#table");
    table.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const tr = table.insertRow();
        for (let j = 0; j < 7; j++) {
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
