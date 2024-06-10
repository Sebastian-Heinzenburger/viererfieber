function createGame() {
  document.location.href = "/lobby";
}

function joinGame() {
  let dialog = document.querySelector("#join_game_dialog");
  let grey_out = document.querySelector("#grey_out_div")
  dialog.setAttribute("open", "open");
  grey_out.removeAttribute("hidden");
  dialog.style.zIndex = "10";
  grey_out.style.zIndex = "9";
  document.querySelector("#num0").focus();
}

function closeDialog() {
  let dialog = document.querySelector("#join_game_dialog");
  let grey_out = document.querySelector("#grey_out_div")
  dialog.close();
  grey_out.setAttribute("hidden","hidden");
  dialog.style.zIndex = "0";
  grey_out.style.zIndex = "0";
}

function focusInput(current, cur_index) {
  if (/[^0-9]/g.test(current.value)) {
    current.value = current.value.replace(/[^0-9]/g, '');
  }
  else {
    document.querySelector(`#num${cur_index+1}`).focus();
  }
}


function submitDialog(current, index) {
  if (/[^0-9]/g.test(current.value)) {
    current.value = current.value.replace(/[^0-9]/g, '');
  }
  else {
    let num0 = document.querySelector("#num0");
    let num1 = document.querySelector("#num1");
    let num2 = document.querySelector("#num2");
    let num3 = document.querySelector("#num3");

    document.querySelector("#code").value = num0.value+num1.value+num2.value+num3.value;
    const dialogForm = document.querySelector('#lobbyForm');

    if (dialogForm.checkValidity() && num0.value!="" && num1.value!="" && num2.value!="" && num3.value!=""){
      num0.value = "";
      num1.value = "";
      num2.value = "";
      num3.value = "";
      dialogForm.submit()
    }
  }
}

(async() => {
  let background = document.querySelector("#background_div");
  while(!!"Pineapple"){
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