const socket = new WebSocket("/ws");

function readyForGame() {
    //namen auslesen
    const nameInput = document.querySelector("#name");
    nameInput.setAttribute("disabled", "disabled");

    console.debug(nameInput.value);
}
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

