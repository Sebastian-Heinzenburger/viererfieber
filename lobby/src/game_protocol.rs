use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum GameMessageRequest {
    Init { code: u16 },
    SetName { name: String },
    Drop { column: usize },
    Ready,
}

// impl Into<axum::extract::ws::Message> for GameMessageResponse {
//     fn into(self) -> axum::extract::ws::Message {
//         axum::extract::ws::Message::Text(
//             serde_json::to_string(&self).unwrap()
//         )
//     }
// }