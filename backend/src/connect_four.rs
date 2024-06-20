use std::{collections::HashMap, sync::Arc};

use anyhow::{anyhow, Result};
use axum::extract::ws::WebSocket;
use rand::Rng;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

#[derive(Default, Debug, Clone)]
pub struct LobbyStore(pub Arc<Mutex<HashMap<Lobbycode, Lobby>>>);

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq, Hash)]
pub struct Lobbycode(pub u16);

#[derive(Debug)]
pub struct Lobby {
    pub code: Lobbycode,
    sockets: (Option<WebSocket>, Option<WebSocket>),
}

impl Lobby {
    pub fn create() -> (Lobbycode, Self) {
        let rand_num: u16 = rand::thread_rng().gen_range(1000..9999);
        (
            Lobbycode(rand_num),
            Lobby {
                code: Lobbycode(rand_num),
                sockets: (None, None),
            },
        )
    }

    pub fn connect(&mut self, socket: WebSocket) -> Result<()> {
        match self.sockets {
            (None, None) => self.sockets.0 = Some(socket),
            (Some(_), None) => self.sockets.1 = Some(socket),
            (None, Some(_)) => self.sockets.0 = Some(socket),
            (Some(_), Some(_)) => return Err(anyhow!("The lobby is full!")),
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn dummy_test() {
        assert_eq!(1 + 1, 2);
    }
}
