#![allow(dead_code)]

use anyhow::Result;

mod webserver;
mod connect_four;

#[tokio::main]
async fn main() -> Result<()> {
    webserver::start().await?;
    Ok(())
}
