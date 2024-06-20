use axum::body::Body;
use axum::extract::{ws::WebSocket, State, WebSocketUpgrade};
use axum::http::StatusCode;
use axum::response::{Html, IntoResponse, Redirect, Response};
use axum::routing::{any, get};
use axum::{Form, Router};
use axum_server::tls_rustls::RustlsConfig;
use color_eyre::Result;
use game_protocol::{GameMessageRequest, LobbyRequest};
use rand::Rng;
use tokio::fs;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;
use tower_http::services::ServeDir;

use lobby::{Lobby, PlayerTurn, WebScoketMutex};
use websocket_misc::recv_message;

mod game_protocol;
mod lobby;
mod websocket_misc;


#[derive(Clone, Default)]
struct AppState {
    lobbies: Arc<Mutex<HashMap<u16, Lobby>>>,
}


/*   lobby handler    */

async fn lobby_http_response(lobby_code: u16) -> Response<Body> {
    let html_content = include_str!("../../templates/lobby.html");
    let html_with_lobby_code = html_content.replace("{code}", &format!("{lobby_code}"));
    Html(html_with_lobby_code).into_response()
}


fn lobby_not_found() -> Response {
    Redirect::to("https://http.cat/404").into_response()
}


async fn lobby_post_handler(
    State(state): State<AppState>,
    Form(params): Form<LobbyRequest>,
) -> Result<Response, Response> {
    let mut lobbies = state.lobbies.lock().await;

    let query_lobby_code = params.code.unwrap_or_else(|| {
        let new_lobby_code: u16 = rand::thread_rng().gen_range(1000..9999);
        let new_lobby = Lobby::new(new_lobby_code);
        lobbies.insert(new_lobby_code, new_lobby);
        new_lobby_code
    });

    let lobby_code = match lobbies.get(&query_lobby_code) {
        Some(lobby) => lobby.lobby_code,
        None => return Err(lobby_not_found()),
    };

    Ok(lobby_http_response(lobby_code).await)
}


/* player socket handler */

async fn handle_player_connection(state: AppState, socket: WebSocket) {
    let socket_mutex = WebScoketMutex::new(Mutex::new(socket));

    let (connected_lobby_code, connected_player) = recv_init_message(&socket_mutex, &state).await;

    while let Ok(message) = recv_message(&socket_mutex).await {
        handle_message(message, connected_lobby_code, connected_player, &state).await;
    }
    disconnect_player(connected_lobby_code, connected_player, &state).await;
}


async fn handle_message(message: GameMessageRequest, connected_lobby_code: u16, connected_player: PlayerTurn, state: &AppState) {
    match message {

        GameMessageRequest::Ready => {
            let mut lobbies = state.lobbies.lock().await;
            let lobby = lobbies
                .get_mut(&connected_lobby_code)
                .expect("this lobby does not exist");
            match connected_player {
                PlayerTurn::PlayerOne => lobby.ready.0 = true,
                PlayerTurn::PlayerTwo => lobby.ready.1 = true,
            }
            lobby.broadcast_state().await;
        },

        GameMessageRequest::SetName { name } => {
            let mut lobbies = state.lobbies.lock().await;
            let lobby = lobbies
                .get_mut(&connected_lobby_code)
                .expect("this lobby does not exist");
            match connected_player {
                PlayerTurn::PlayerOne => lobby.name_player1 = name,
                PlayerTurn::PlayerTwo => lobby.name_player2 = name,
            }
            lobby.broadcast_state().await;
        },

        GameMessageRequest::Drop { column } => {
            let mut lobbies = state.lobbies.lock().await;
            let lobby = lobbies
                .get_mut(&connected_lobby_code)
                .expect("this lobby does not exist");
            match lobby.ready {
                (false, _) | (_, false) => { /* "Böser Bube will schon loslegen" */},
                (true, true) => {
                    match (&connected_player, lobby.turn) {
                        (PlayerTurn::PlayerOne, 1) | (PlayerTurn::PlayerTwo, 2) => {
                            lobby.drop_disc(column);
                            lobby.broadcast_state().await;
                        }
                        _ => {/* "Böser Bube wollte vor seinem Zug legen" */ }
                    }
                }
            };
            if lobby.end {
                lobbies.remove(&connected_lobby_code);
            }
        },

        _ => panic!("Boah da muss ich aber erstmal nachdenken")
    }

}


async fn recv_init_message(
    socket_mutex: &Arc<Mutex<WebSocket>>,
    state: &AppState,
) -> (u16, PlayerTurn) {

    let mut lobbies = state.lobbies.lock().await;

    let lobby = if let Ok(GameMessageRequest::Init { code }) = recv_message(socket_mutex).await {
        lobbies.get_mut(&code)
    } else {
        panic!("You are behaving wrong! :(");
    }.expect("You are joinging a lobby that does not exist!");

    let player = match (&lobby.socket1, &lobby.socket2) {
        (None, _) => { lobby.socket1 = Some(socket_mutex.clone()); PlayerTurn::PlayerOne }
        (_, None) => { lobby.socket2 = Some(socket_mutex.clone()); PlayerTurn::PlayerTwo }
        (Some(_), Some(_)) => { panic!("You are trying to join a full lobby!") }
    };

    lobby.broadcast_state().await;
    (lobby.lobby_code, player)
}


async fn disconnect_player(connected_lobby_code: u16, connected_player: PlayerTurn, state: &AppState) {
    let mut lobbies = state.lobbies.lock().await;
    let lobby = lobbies
        .get_mut(&connected_lobby_code)
        .expect("this lobby does not exist");

    match connected_player {
        PlayerTurn::PlayerOne => {
            lobby.name_player1 = "".to_owned();
            lobby.ready.0 = false;
            lobby.socket1 = None;
        },
        PlayerTurn::PlayerTwo => {
            lobby.name_player2 = "".to_owned();
            lobby.ready.1 = false;
            lobby.socket2 = None;
        }
    }

    match (&lobby.socket1, &lobby.socket2) {
        (None, None) => { lobbies.remove(&connected_lobby_code); },
                  _  => { lobby.broadcast_state().await; }
    }

}


async fn switch_protocols(State(state): State<AppState>, ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(move |socket| handle_player_connection(state, socket))
}


/*    misc handlers    */

async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not Found")
}


#[tokio::main]
async fn main() -> Result<()> {
    let app = Router::new()
        .nest_service("/", ServeDir::new("../templates"))
        .nest_service("/static", ServeDir::new("../static/"))
        .route("/lobby", any(lobby_post_handler))
        .route("/ws", get(switch_protocols))
        .with_state(AppState::default())
        .fallback(not_found);

    let address = "0.0.0.0:8080";
    println!("Strarting Server on http://{address}");

    const SSL_PATH_CERT: &str = "/.ssl/cert.pem";
    const SSL_PATH_KEY: &str = "/.ssl/key.pem";

    if let Ok(true) = fs::try_exists(SSL_PATH_CERT).await {
        let tls_config = RustlsConfig::from_pem_file(SSL_PATH_CERT, SSL_PATH_KEY).await?;
        let listener = std::net::TcpListener::bind(address)?;
        axum_server::from_tcp_rustls(listener, tls_config).serve(app.into_make_service()).await?;
    } else {
        let listener = tokio::net::TcpListener::bind(address).await?;
        axum::serve(listener, app).await?;
    }

    Ok(())
}
