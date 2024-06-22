use std::{collections::HashMap, sync::Arc};

use anyhow::{anyhow, Result};
use axum::extract::ws::{self, WebSocket};
use rand::{seq::SliceRandom, thread_rng, Rng};
use serde::{Deserialize, Serialize};
use tokio::{sync::{mpsc::{UnboundedReceiver, UnboundedSender}, Mutex}, time::Duration};

#[derive(Debug)]
pub struct LobbyExecutor {
    transfer_lobby_socket: UnboundedSender<(Lobbycode, WebSocket)>,
    transfer_lobby_socket_rx: UnboundedReceiver<(Lobbycode, WebSocket)>,
}


#[derive(Default, Debug, Clone)]
pub struct LobbyStore(pub Arc<Mutex<HashMap<Lobbycode, Lobby>>>);

impl LobbyStore {

    pub async fn exists_code(&self, lobby_code: impl IntoLobbycode) -> Option<Lobbycode> {
        let lobbies = self.0.lock().await;
        let lobby = lobbies.get(&lobby_code.into())?;
        Some(lobby.code.clone())
    }

    pub async fn create_lobby(&mut self) -> Lobbycode {
        let lobby_to_insert = Lobby::create();
        let lobby_code = lobby_to_insert.code.clone();
        let mut lobbies = self.0.lock().await;
        lobbies.insert(lobby_code.clone(), lobby_to_insert);
        lobby_code
    }

}

#[derive(Deserialize, Serialize, Debug, Clone, Eq, PartialEq, Hash)]
pub struct Lobbycode(pub u16);

pub trait IntoLobbycode {
    fn into(self) -> Lobbycode;
}

impl IntoLobbycode for u16 {
    fn into(self) -> Lobbycode {
        Lobbycode(self)
    }
}

impl IntoLobbycode for Lobbycode {
    fn into(self) -> Lobbycode {
        self
    }
}

#[derive(Debug)]
pub struct Lobby {
    pub code: Lobbycode,
    players: (Option<Player>, Option<Player>),
}

#[derive(Debug)]
struct Player {
    pub socket: WebSocket, //TODO unpub
    name: String
}

impl Player {
    fn new(socket: WebSocket) -> Self {
        Player { socket, name: ["WeinendesWürmchen", "SchüchterneSchnecke", "FlüsternderFuchs", "KicherndesKätzchen", "SchnurrendesSchnabeltier", "SchlummernderSchmetterling", "HüpfendesHäschen", "TapsigerTapir", "KuschligesKänguru", "PustenderPinguin", "ZaghafterZebra", "FlinkesFrettchen", "SanftesSeepferdchen", "KnuddeligerKoala", "FröhlicherFrosch"].choose(&mut thread_rng()).unwrap().to_string() }
    }
}

impl Lobby {
    pub fn create() -> Self {
        let rand_num: u16 = rand::thread_rng().gen_range(1000..9999);
        Lobby {
            code: Lobbycode(rand_num),
            players: (None, None),
        }
    }

    pub fn connect(&mut self, socket: WebSocket) -> Result<()> {
        let new_player = Player::new(socket);
        dbg!("adding player!", &new_player.name);
        match self.players {
            (None, None) => self.players.0 = Some(new_player),
            (Some(_), None) => self.players.1 = Some(new_player),
            (None, Some(_)) => self.players.0 = Some(new_player),
            (Some(_), Some(_)) => return Err(anyhow!("The lobby is full!")),
        }
        Ok(())
    }

    pub async fn start(&mut self) -> Result<()> {
        loop {
            if let Some(player) = self.players.0.as_mut() {
                player.socket.send(ws::Message::Text("Hello".to_string())).await?;
            }
            if let Some(player) = self.players.1.as_mut() {
                player.socket.send(ws::Message::Text("Hello2".to_string())).await?;
            }
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn dummy_test() {
        assert_eq!(1 + 1, 2);
    }
}
