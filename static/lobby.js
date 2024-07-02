let sound_array = ["https://dn720304.ca.archive.org/0/items/WiiSportsResortOST/004%20Wii%20Sports%20Resort%20Title%20Ret.mp3","https://ia802302.us.archive.org/33/items/SSBA_mp3/Vol.%2001%20-%20Super%20Smash%20Bros%2F009.%20Battlefield.mp3","https://ia802202.us.archive.org/8/items/genshin-impact-music-collection/13.%20Forest%20of%20J%C3%B1%C4%81na%20and%20Vidy%C4%81%2FDisc%204%20-%20Battles%20of%20Sumeru%2F097.%20Swirls%20of%20the%20Stream.mp3","https://ia601406.us.archive.org/13/items/c-418-aria-math-minecraft-volume-beta/C418%20-%20Aria%20Math%20%28Minecraft%20Volume%20Beta%29.mp3", "https://archive.org/download/53-skyrim-atmospheres/01%20-%20Dragonborn.mp3"];
let sound_index = 0;
let sound = new Audio(sound_array[sound_index]);
sound.addEventListener("ended", nextSound);        

function nextSound(){
    if(sound_index > sound_array.length-1){
        sound_index = 0;
    }
    sound.src = sound_array[sound_index++];
    sound.load();
    sound.play()
        .catch(error => {
            console.log("Error playing sound");
            sound_index = 0;
            toggleSound(true)
        });
}

function toggleSound(force_pause){
  let line = document.querySelector("#sound_icon line")
  if(!sound.paused || force_pause){
    line.setAttribute("x1","5.281");
    line.setAttribute("y1","22.032");
    line.setAttribute("x2","22.058");
    line.setAttribute("y2","1.125");
    sound.pause()
  }
  else{
    line.setAttribute("x1","0");
    line.setAttribute("y1","0");
    line.setAttribute("x2","0");
    line.setAttribute("y2","0");
    nextSound();
  }
}
toggleSound();


const socket = new WebSocket("/ws");
let socket_open = false;
let chip_falling_animation = false;

//Copy invitation link to clipboard - only works with https protocol
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


//Called when server sends a message
socket.onmessage = function (e) {
    console.log(e.data);
    let message_json = JSON.parse(e.data);
    refreshLobby(message_json);
};

//Called when websocket connection is established
socket.onopen = function () {
    createTable([[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]);
    socket_open = true;
    let obj = {};
    obj.type = "init";
    obj.code = parseInt(document.querySelector("#code_input").value);
    socket.send(JSON.stringify(obj));
    console.log("Geinited");
}

//Called when user changes their name
function updateName(){  
    let obj = {};
    obj.type = "setName";
    obj.name = document.querySelector("#own_character_name").value;
    socket.send(JSON.stringify(obj));
}

//Inform server that user is ready to play
function readyForGame() {
    document.querySelector("#ready").setAttribute("disabled", "disabled");
    let obj = {};
    obj.type = "ready";
    socket.send(JSON.stringify(obj));
}

//Called when user clicks on a game field cell
async function clickCell(column){
    let chip = document.querySelector("#chip");
    let table = document.querySelector("#table");
    
    chip_falling_animation = true;
    for (let i = 0; i < table.rows.length; i++) {
        await new Promise(r => setTimeout(r, 100));
        let column_element = table.rows[i].cells[column];
        let rect = column_element.getBoundingClientRect();
        
        if(column_element.firstChild.getAttribute("data-owner")==0){
            chip.style.top = (rect.top+globalThis.scrollY)+"px";
            chip.style.left = rect.left + "px";
        }
        else{
            break;
        }
    }
    let obj = {};
    obj.type = "drop";
    obj.column = column;
    socket.send(JSON.stringify(obj));
    await new Promise(r => setTimeout(r, 500));
    chip_falling_animation = false;
}

//Called when server sends lobby object
function refreshLobby(message_json){
    let status = document.querySelector("#status_button");
    if(!message_json.opponent_ready || !message_json.own_ready){
        status.innerText = "Warten bis alle bereit sind..."
        status.style.opacity = "0.5";
        status.style.animation = "";
        status.parentElement.onmouseover = (event) => {
        };

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
        if(message_json.end){
            status.innerText = message_json.turn ? "٩(＾◡＾)۶ Gewonnen " : "༼ ༎ຶ ᆺ ༎ຶ༽ Verloren";
            status.style.opacity = "1";
            status.style.animation = "blink 0.5s step-start 0s infinite";
            status.classList.add("status_button");
            status.setAttribute("onclick","window.location.href='"+document.location.protocol + "//" + document.location.host+"';");
            status.style.cursor = "pointer";
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
        if(message_json.turn && !message_json.end){
            document.querySelector("#chip").removeAttribute("hidden");
        }
        else{
            document.querySelector("#chip").setAttribute("hidden","hidden");
        }

        let width = document.querySelector("table tr td").getBoundingClientRect().width;
        console.log(width);
        
        document.querySelector("#chip").style.width = width + "px";
        document.querySelector("#chip").style.height = width + "px";

        if(message_json.player_no == 2){
            document.querySelector("#chip").style.background = "linear-gradient(#ACA900, #98391C 60%, #200A00)";
        }
        else{
            document.querySelector("#chip").style.background = "linear-gradient(#5356FF, #67C6E3 60%,#DFF5FF)";
        }
                                                
    }
}

//Build game field from javascript
function createTable(server_field){
    let table = document.querySelector("#table");
    table.innerHTML = ""; //Start by clearing table
    let maxRows = 6;
    let maxColumns = 7;
    for (let i = maxRows-1; i >= 0; i--) {
        const tr = table.insertRow();
        for (let j = 0; j < maxColumns; j++) {
            //Fill table with chips
            const td = tr.insertCell();
            td.setAttribute("onclick","clickCell("+j+")");
            td.setAttribute("class", "table_field");
            let color;
            switch (server_field[i][j]) {
                case 2:
                    color = "linear-gradient(#ACA900, #98391C 60%, #200A00)";
                    break;
                case 1: 
                    color = "linear-gradient(#5356FF, #67C6E3 60%,#DFF5FF)";
                    break;
                default:
                    color = "var(--background-color)";
            }
        
            let circle_div = document.createElement("div");
            circle_div.setAttribute("class","background_circle");
            
            circle_div.style.width = "100%";
            circle_div.style.aspectRatio = "1 / 1";
            circle_div.style.background = color;
            circle_div.setAttribute("data-owner",server_field[i][j]);
            td.appendChild(circle_div);

            td.style.width = "calc(100% / 7)";
        }
    }
}


//If game running and user turn awaited, place a simulated chip on field column nearest to mouse pointer
document.addEventListener("mousemove", (e) => {
    let chip = document.querySelector("#chip");
    if(!chip_falling_animation){
        let table = document.querySelector("#table");
        for (let i = 0; i < table.rows[0]?.cells.length; i++) {
            let column = table.rows[0].cells[i];
            let rect = column.getBoundingClientRect();
            
            if(e.clientX>=rect.left && e.clientX<rect.right){
                chip.style.top = (rect.top+globalThis.scrollY-chip.clientHeight/2)+"px";
                chip.style.left = rect.left + "px";
            }
        }
    }    
});

function openImprint(){
    document.querySelector('#imprint_dialog').setAttribute('open','open');
  }
  
  function closeImprint(){
    document.querySelector('#imprint_dialog').removeAttribute('open');
  }
