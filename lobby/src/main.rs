use axum::{
    body::Body,
    extract::{ws::WebSocket, Query, State, WebSocketUpgrade},
    http::{self, header, HeaderMap, StatusCode},
    response::{IntoResponse, Redirect, Response},
    routing::get,
    Router,
};
use color_eyre::Result;
use game_protocol::GameMessageRequest;
use lobby::{Lobby, Player, WebScoketMutex};
use rand::Rng;
use serde::Deserialize;
use std::{collections::HashMap, sync::Arc};
use tokio::{fs, net::TcpListener, sync::Mutex};
use tower_http::services::ServeDir;
use websocket_misc::recv_message;

mod game_protocol;
mod lobby;
mod websocket_misc;

#[derive(Clone, Default)]
struct AppState {
    lobbies: Arc<Mutex<HashMap<u16, Lobby>>>,
}

#[derive(Deserialize)]
struct LobbyRequest {
    num0: Option<u8>,
    num1: Option<u8>,
    num2: Option<u8>,
    num3: Option<u8>,
}

async fn lobby_http_response(lobby_code: u16) -> http::Response<Body> {
    let mut header_map = HeaderMap::new();
    header_map.append(header::CONTENT_TYPE, "text/html".parse().unwrap());
    let html_content = fs::read_to_string("../templates/lobby.html").await.unwrap();
    let html_with_lobby_code = html_content.replace("{code}", &format!("{lobby_code}"));

    return (header_map, (html_with_lobby_code)).into_response();
}

async fn lobby_post_handler(
    State(state): State<AppState>,
    Query(params): Query<LobbyRequest>,
) -> Response {
    let mut lobbies = state.lobbies.lock().await;

    let lobby_code = if params.num0.is_none() {
        let new_lobby_code: u16 = rand::thread_rng().gen_range(1000..9999);
        let new_lobby = Lobby::new(new_lobby_code);
        lobbies.insert(new_lobby_code, new_lobby);
        lobbies.get(&new_lobby_code).unwrap().lobby_code
    } else {
        let request_lobby_code = format!(
            "{}{}{}{}",
            params.num0.unwrap(),
            params.num1.unwrap(),
            params.num2.unwrap(),
            params.num3.unwrap()
        )
        .parse()
        .unwrap();

        match lobbies.get(&request_lobby_code) {
            Some(lobby_code) => lobby_code.lobby_code,
            None => {
                return Redirect::to("https://http.cat/404").into_response();
            }
        }
    };

    return lobby_http_response(lobby_code).await;
}

async fn socket_handler(state: AppState, socket: WebSocket) {
    let socket_mutex = WebScoketMutex::new(Mutex::new(socket));

    let (connected_lobby_code, connected_player) =
        socket_lobby_and_player(&socket_mutex, &state).await;

    loop {
        match recv_message(&socket_mutex).await {
            Ok(GameMessageRequest::SetName { name }) => {
                let mut lobbies = state.lobbies.lock().await;
                let lobby = lobbies
                    .get_mut(&connected_lobby_code)
                    .expect("this lobby does not exist");
                match connected_player {
                    Player::PlayerOne => lobby.name_player1 = name,
                    Player::PlayerTwo => lobby.name_player2 = name,
                }
                lobby.broadcast_state().await;
            }
            Ok(GameMessageRequest::Ready) => {
                let mut lobbies = state.lobbies.lock().await;
                let lobby = lobbies
                    .get_mut(&connected_lobby_code)
                    .expect("this lobby does not exist");
                match connected_player {
                    Player::PlayerOne => lobby.ready.0 = true,
                    Player::PlayerTwo => lobby.ready.1 = true,
                }
                lobby.broadcast_state().await;
            }
            Ok(GameMessageRequest::Drop { column }) => {
                let mut lobbies = state.lobbies.lock().await;
                let lobby = lobbies
                    .get_mut(&connected_lobby_code)
                    .expect("this lobby does not exist");
                lobby.drop(column);
                lobby.broadcast_state().await;
                print!("Drop");
            }
            Err(e) => {
                eprintln!("{}", e);
                return;
            }
            _ => {}
        }
    }
}

async fn socket_lobby_and_player(
    socket_mutex: &Arc<Mutex<WebSocket>>,
    state: &AppState,
) -> (u16, Player) {
    return match recv_message(socket_mutex).await {
        Ok(GameMessageRequest::Init { code }) => {
            let mut lobbies = state.lobbies.lock().await;
            match lobbies.get_mut(&code) {
                Some(lobby) => {
                    if lobby.socket1.is_none() {
                        lobby.socket1 = Some(socket_mutex.clone());
                        lobby.broadcast_state().await;
                        (lobby.lobby_code, Player::PlayerOne)
                    } else if lobby.socket2.is_none() {
                        lobby.socket2 = Some(socket_mutex.clone());
                        lobby.broadcast_state().await;
                        (lobby.lobby_code, Player::PlayerTwo)
                    } else {
                        todo!()
                    }
                }
                None => todo!(),
            }
        }
        _ => todo!(),
    };
}

async fn switch_protocols(State(state): State<AppState>, ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(move |socket| socket_handler(state, socket))
}

async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not Found")
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/ws", get(switch_protocols))
        .nest_service("/", ServeDir::new("../templates"))
        .nest_service("/static", ServeDir::new("../static/"))
        .route("/lobby", get(lobby_post_handler))
        .with_state(AppState::default())
        .fallback(not_found);

    let listener = TcpListener::bind("0.0.0.0:3001").await?;
    println!("Started Server on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await?;

    Ok(())
}
