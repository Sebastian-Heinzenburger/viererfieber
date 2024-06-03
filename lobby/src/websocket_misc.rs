use std::time::Duration;

use axum::extract::ws;
use color_eyre::Result;

use crate::{game_protocol::GameMessageRequest, lobby::WebScoketMutex};

pub async fn recv_message(socket_mutex: &WebScoketMutex) -> Result<GameMessageRequest> {

    // not so nice. TODO(sebastian): maybe some RwLock instead?
    loop { 
        let mut socket = socket_mutex.lock().await;

        tokio::select! {
            ws_message = socket.recv() => {
                if let Some(Ok(ws::Message::Text(msg_str))) = ws_message {
                    let msg: GameMessageRequest = serde_json::from_str(&msg_str)?;
                    return Ok(msg);
                } else {
                    panic!("at the disco");
                }
            },
            _timeout_to_release_the_mutex_lock = tokio::time::sleep(Duration::from_millis(20)) => {},

        }
    }

}
