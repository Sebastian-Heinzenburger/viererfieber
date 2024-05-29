function createGame() {
    document.location.href = "/lobby";
  }

  function joinGame() {
    document.querySelector("#join_game_dialog").setAttribute("open", "open");
    document.querySelector("#num0").focus();
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