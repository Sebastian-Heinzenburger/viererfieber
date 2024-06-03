use std::sync::Arc;

use axum::extract::ws::{self, WebSocket};
use serde_json::json;
use tokio::sync::Mutex;

pub type WebScoketMutex = Arc<Mutex<WebSocket>>;

pub struct Lobby {
    pub turn: i8,
    pub field: [[i8; 7]; 6],
    pub end: bool,
    pub lobby_code: u16,
    pub name_player1: String,
    pub name_player2: String,
    pub ready: (bool, bool),
    pub socket1: Option<WebScoketMutex>,
    pub socket2: Option<WebScoketMutex>,
}

impl Lobby {
    pub fn new(lobby_code: u16) -> Self {
        Self {
            turn: 1,
            field: [[0i8; 7]; 6],
            ready: (false, false),
            end: false,
            lobby_code,
            name_player1: String::from("WeinendesWürmchen"),
            name_player2: String::from("SchüchterneSchnecke"),
            socket1: None,
            socket2: None,
        }
    }

    pub fn drop_disc(&mut self, column: usize) {
        let rows: usize = 6;
        if self.field[rows - 1][column] == 0 && !self.end {
            for row in 0..rows {
                if self.field[row][column] == 0 {
                    self.field[row][column] = self.turn;
                    if self.is_game_won() {
                        self.end = true;
                    } else if self.turn == 1 {
                        self.turn = 2;
                    } else {
                        self.turn = 1;
                    }
                    break;
                }
            }
        }
    }

    fn is_game_won(&self) -> bool {
        for c in 0..4 {
            //Horizontal
            for r in 0..6 {
                if self.field[r][c] == self.turn
                    && self.field[r][c + 1] == self.turn
                    && self.field[r][c + 2] == self.turn
                    && self.field[r][c + 3] == self.turn
                {
                    return true;
                }
            }
        }

        for c in 0..7 {
            //Vertical
            for r in 0..3 {
                if self.field[r][c] == self.turn
                    && self.field[r + 1][c] == self.turn
                    && self.field[r + 2][c] == self.turn
                    && self.field[r + 3][c] == self.turn
                {
                    return true;
                }
            }
        }

        for c in 0..4 {
            //Diagonal top right
            for r in 0..3 {
                if self.field[r][c] == self.turn
                    && self.field[r + 1][c + 1] == self.turn
                    && self.field[r + 2][c + 2] == self.turn
                    && self.field[r + 3][c + 3] == self.turn
                {
                    return true;
                }
            }
        }

        for c in 0..4 {
            //Diagonal top left
            for r in 3..6 {
                if self.field[r][c] == self.turn
                    && self.field[r - 1][c + 1] == self.turn
                    && self.field[r - 2][c + 2] == self.turn
                    && self.field[r - 3][c + 3] == self.turn
                {
                    return true;
                }
            }
        }
        false
    }


    pub async fn broadcast_state(&self) {

        if let Some(socket1_mutex) = &self.socket1 {
            let mut socket1 = socket1_mutex.lock().await;

            socket1
                .send(ws::Message::Text(
                    json!({
                        "lobby_code": self.lobby_code,
                        "turn": self.turn == 1,
                        "field": self.field,
                        "end": self.end,
                        "own_ready": self.ready.0,
                        "opponent_ready": self.ready.1,
                        "own_name": self.name_player1,
                        "opponent_name": self.name_player2
                    })
                    .to_string(),
                ))
                .await
                .unwrap();
        }

        if let Some(socket2_mutex) = &self.socket2 {
            let mut socket2 = socket2_mutex.lock().await;
            socket2
                .send(ws::Message::Text(
                    json!({
                        "lobby_code": self.lobby_code,
                        "turn": self.turn == 2,
                        "field": self.field,
                        "end": self.end,
                        "own_ready": self.ready.1,
                        "opponent_ready": self.ready.0,
                        "own_name": self.name_player2,
                        "opponent_name": self.name_player1
                    })
                    .to_string(),
                ))
                .await
                .unwrap();
        }

    }
}

#[derive(Clone, Copy, Debug)]
pub enum PlayerTurn {
    PlayerOne,
    PlayerTwo,
}

