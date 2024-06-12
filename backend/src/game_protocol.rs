use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct LobbyRequest {
    pub code: Option<u16>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum GameMessageRequest {
    Init { code: u16 },
    SetName { name: String },
    Drop { column: usize },
    Ready,
}
