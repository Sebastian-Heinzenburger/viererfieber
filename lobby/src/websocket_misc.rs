use axum::extract::ws;
use color_eyre::{eyre::eyre, Result};

use crate::{game_protocol::GameMessageRequest, lobby::WebScoketMutex};

pub async fn recv_message(socket: &WebScoketMutex) -> Result<GameMessageRequest> {
    let mut socket = socket.lock().await;
    let ws::Message::Text(msg_str) = socket
        .recv()
        .await
        .expect("disconnected")
        .expect("malformed")
    else {
        return Err(eyre!("Received non Text websocket message"));
    };

    let msg: GameMessageRequest = serde_json::from_str(&msg_str).expect("couldnt parse message");

    Ok(msg)
}

/*
async fn send_message(socket_mutex: &Arc<Mutex<WebSocket>>, msg: GameMessageResponse) {
    let mut socket = socket_mutex.lock().await;
    socket.send(msg.into()).await.expect("disconnected");
}
*/

