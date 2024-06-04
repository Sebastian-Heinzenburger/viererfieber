function createGame() {
  document.location.href = "/lobby";
}

function joinGame() {
  document.querySelector("#join_game_dialog").setAttribute("open", "open");
  document.querySelector("#num0").focus();
}

function focusInput(current, cur_index) {
  if (/[^0-9]/g.test(current.value)) {
    current.value = current.value.replace(/[^0-9]/g, '');
  }
  else {
    setCodeAtIndex(current.value, cur_index);
    document.querySelector(`#num${cur_index+1}`).focus();
  }
}

function closeDialog() {
  document.querySelector("#join_game_dialog").close()
}

function submitDialog(current, index) {
  if (/[^0-9]/g.test(current.value)) {
    current.value = current.value.replace(/[^0-9]/g, '');
  }
  else {
    setCodeAtIndex(current.value, index);
    const dialogForm = document.querySelector('#lobbyForm');
    if (dialogForm.checkValidity())
      dialogForm.submit()
  }
}

function setCodeAtIndex(num, index) {
  let code = document.querySelector("#code");
  code.value = code.value.substring(0, index) + num + code.value.substring(index + 1);
}

(async() => {
  let background = document.querySelector("#background_section");
  while(true){
    let circle_div = document.createElement("div");
    circle_div.setAttribute("class","background_circle");
    
    let circle_rad = Math.random()*5 + 4;
    let animation_time = Math.random()*4 + 2;
    circle_div.style.animation = "drop "+animation_time+"s";
    circle_div.style.width = circle_rad+"%";
    circle_div.style.paddingBottom = circle_rad+"%";
    circle_div.style.left = Math.floor(Math.random()*background.clientWidth) + "px";
    circle_div.style.top = "-50%";
    circle_div.style.background = Math.random()>0.5 ? "red":"blue";
    
    background.appendChild(circle_div);
    
    circle_div.addEventListener("animationend", (event) => {
      event.target.remove();
    });

    await new Promise(r => setTimeout(r, 500));
    console.log("HALLO :D");
  }
})()