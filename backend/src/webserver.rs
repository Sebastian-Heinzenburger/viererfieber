use anyhow::Result;
use axum::{
    extract::{ws::WebSocket, State, WebSocketUpgrade},
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::any,
    Form, Router,
};
use serde::Deserialize;
use tokio::fs;
use tower_http::services::ServeDir;
use tower_sessions::{MemoryStore, Session, SessionManagerLayer};

use crate::connect_four::{Lobby, LobbyStore, Lobbycode};

#[derive(Debug, Default, Clone)]
struct AppState {
    lobby_store: LobbyStore,
}

async fn socket_handler(socket: WebSocket, state: AppState, code: Lobbycode) {
    let mut lobbies = state.lobby_store.0.lock().await;
    if let Some(lobby) = lobbies.get_mut(&code) {
        lobby.connect(socket).unwrap();
    }
}

async fn switch_protocols(
    State(state): State<AppState>,
    session: Session,
    websocket: WebSocketUpgrade,
) -> impl IntoResponse {
    let session_code = session
        .get("lobby_code")
        .await
        .expect("There was an issue with the session");

    match session_code {
        Some(code) => websocket
            .on_upgrade(move |socket| socket_handler(socket, state, code))
            .into_response(),
        None => (StatusCode::BAD_REQUEST, "your lobby does not exist").into_response(),
    }
}

#[derive(Debug, Deserialize)]
struct LobbyRequestParams {
    code: Option<u16>,
}

async fn lobby_handler(
    session: Session,
    State(state): State<AppState>,
    Form(params): Form<LobbyRequestParams>,
) -> impl IntoResponse {
    let code = match params.code {
        None => Lobby::create().0,
        Some(code) => {
            let lobbies = state.lobby_store.0.lock().await;
            if lobbies.get(&Lobbycode(code)).is_some() {
                Lobbycode(code)
            } else {
                return (StatusCode::NOT_FOUND, "The lobby does not exist").into_response();
            }
        }
    };

    session
        .insert("lobby_code", code.clone())
        .await
        .expect("Could not set sessions lobby code");

    let lobby_template = fs::read_to_string("../templates/lobby.html")
        .await
        .expect("The lobby template is missing")
        .replace("{code}", &format!("{}", code.0));
    Html(lobby_template).into_response()
}

async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not Found :(")
}

pub async fn start() -> Result<()> {
    let session_store = MemoryStore::default();
    let session_layer = SessionManagerLayer::new(session_store).with_secure(false); // also send cookies over non HTTPS connections

    let router = Router::new()
        .route("/ws", any(switch_protocols))
        .route("/lobby", any(lobby_handler))
        .nest_service("/", ServeDir::new("../templates"))
        .nest_service("/static", ServeDir::new("../static/"))
        .fallback(not_found)
        .layer(session_layer)
        .with_state(AppState::default());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    axum::serve(listener, router).await?;
    Ok(())
}
