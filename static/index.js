// autoplay must be enabled in the browser
(new Audio("https://ia802808.us.archive.org/30/items/WiiSportsTheme/Wii Sports Theme.mp3")).play();

//Called by clicking "Spiel erstellen"
function createGame() {
  document.location.href = "/lobby";
}

//Called by clicking "Spiel beitreten"
function joinGame() {
  //Open dialog, grey out background and set focus on first digit input
  let dialog = document.querySelector("#join_game_dialog");
  let grey_out = document.querySelector("#grey_out_div")
  dialog.setAttribute("open", "open");
  grey_out.removeAttribute("hidden");
  dialog.style.zIndex = "10";
  grey_out.style.zIndex = "9";
  document.querySelector("#num0").focus();
}

//Called by clicking "Schließen" in dialog
function closeDialog() {
  //Close dialog and remove grey-out
  let dialog = document.querySelector("#join_game_dialog");
  let grey_out = document.querySelector("#grey_out_div")
  dialog.close();
  grey_out.setAttribute("hidden","hidden");
  dialog.style.zIndex = "0";
  grey_out.style.zIndex = "0";
}

//Input value should be numeric digit
function digitValidity(input){
  if (/[^0-9]/g.test(input.value)) {
    //Delete input value if not a numeric digit
    input.value = input.value.replace(/[^0-9]/g, '');
    return false; //Input not valid
  }
  return true; //Input valid
}

//Auto jump to next input field if current value is valid digit
function focusInput(current, cur_index) {
  if(digitValidity(current)){
    document.querySelector(`#num${cur_index+1}`).focus();
  }
}

//Called when user manually submits dialog or inserts last lobby code digit
function submitDialog() {
    //Last digit is not checked automatically, thats why it's checked here
    if(digitValidity(document.querySelector("#num3"))){
      let num0 = document.querySelector("#num0");
      let num1 = document.querySelector("#num1");
      let num2 = document.querySelector("#num2");
      let num3 = document.querySelector("#num3");

      //Merge all values into one hidden input field to avoid processing 4 parameters in backend
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

//Background Animation - Falling Chips
(async() => {
  let background = document.querySelector("#background_div");
  let timer_date = Date.now();
  while(!!"Pineapple"){ //Short for while(true)
    
    if(timer_date < Date.now()-500){ //Wait 500ms, prevents high memory usage when not in tab
      let circle_div = document.createElement("div");
      circle_div.setAttribute("class","background_circle");
      
      let circle_rad = Math.random()*5 + 4; //Random chip radian
      let animation_time = Math.random()*4 + 2; //Random falling time
      circle_div.style.animation = "drop "+animation_time+"s";
      circle_div.style.width = circle_rad+"%";
      circle_div.style.paddingBottom = circle_rad+"%";
      circle_div.style.left = Math.floor(Math.random()*background.clientWidth) + "px"; //Random x-coordinate
      circle_div.style.top = "-50%"; //Summon above user screen, invisible to user
      circle_div.style.background = Math.random()>0.5 ? "linear-gradient(#5356FF, #67C6E3 60%,#DFF5FF)":"linear-gradient(#ACA900, #98391C 60%, #200A00)"; //either blue or red chip
      background.appendChild(circle_div);
      
      circle_div.addEventListener("animationend", (event) => {
        //Remove animated chip
        event.target.remove();
      });
      timer_date = Date.now();
    }
    await new Promise(r => setTimeout(r, 50));
  }
})();