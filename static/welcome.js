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
