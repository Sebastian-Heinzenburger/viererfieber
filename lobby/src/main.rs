fn main()->(){

}

struct Lobby {
    turn: i8,
    field: [[i8; 7]; 6],
    end: bool,
    lobby_code: i8,
    name_player1: String,
    name_player2: String,
    sid_player1: String,
    sid_player2: String,
    socket: String //später socket objekt?
}

impl Lobby {
    fn new(lobby_code:i8, sid_player1: String, socket: String) -> Self{
        return Lobby{
            turn: 1,
            field: [[0i8; 7]; 6],
            end: false,
            lobby_code: lobby_code,
            name_player1: String::from("WeinendesWürmchen"),
            name_player2: String::from("SchüchterneSchnecke"),
            sid_player1: sid_player1,
            sid_player2: String::from(""),
            socket: socket            
        }
    }

    fn drop(&mut self, column: usize) -> (){
        let rows:usize = 6;
        if self.field[rows-1][column] == 0 && !self.end{
            for row in 0usize..rows{
				if self.field[row as usize][column] == 0{
					self.field[row][column] = self.turn;
					if self.is_game_won(){
						self.end = true;
                    }
					else{
						if self.turn == 1{
							self.turn = 2;
                        }
						else{
							self.turn = 1;
                        }
                    }
					break;
                }
            }
        }
    }
    fn is_game_won(&self) -> bool{
        for c in 0usize .. 4usize{ //Horizontal
			for r in 0usize ..6usize{
				if self.field[r][c] == self.turn && self.field[r][c+1] == self.turn && self.field[r][c+2] == self.turn && self.field[r][c+3] == self.turn{
					return true;
                }
            }
        }

        for c in 0usize..7usize{ //Vertical
			for r in 0usize..3usize{
				if self.field[r][c] == self.turn && self.field[r+1][c] == self.turn && self.field[r+2][c] == self.turn && self.field[r+3][c] == self.turn{
					return true;
                }
            }
        }

		for c in 0usize .. 4usize{ //Diagonal top right
			for r in 0usize ..3usize{
				if self.field[r][c] == self.turn && self.field[r+1][c+1] == self.turn && self.field[r+2][c+2] == self.turn && self.field[r+3][c+3] == self.turn{
					return true;
                }
            }
        }

		for c in 0usize .. 4usize{ //Diagonal top left
			for r in 3usize ..6usize{
				if self.field[r][c] == self.turn && self.field[r-1][c+1] == self.turn && self.field[r-2][c+2] == self.turn && self.field[r-3][c+3] == self.turn{
					return true;
                }
            }
        }                    
        return false;
    }

    fn print_field(&self) -> (){
        for row in 0usize..6usize{
            for column in 0usize..7usize{
                print!("{}",self.field[5-row][column].to_string());
            }
            println!();
        }
        println!();
    }
}

#[cfg(test)]
mod tests {
    use crate::Lobby;
    #[test]
    fn horizontal1(){
        let mut lobby = Lobby:: new(1,String::from(""),String::from(""));
        lobby.drop(0);
        lobby.drop(0);
        lobby.drop(1);
        lobby.drop(1);
        lobby.drop(2);
        lobby.drop(2);
        lobby.drop(3);
        lobby.drop(3);
        assert!(lobby.end && lobby.turn == 1);
    }
    #[test]
    fn vertical1(){
        let mut lobby = Lobby:: new(1,String::from(""),String::from(""));
        lobby.drop(0);
        lobby.drop(1);
        lobby.drop(0);
        lobby.drop(1);
        lobby.drop(0);
        lobby.drop(1);
        lobby.drop(0);
        lobby.drop(1);
        assert!(lobby.end && lobby.turn == 1);
    }
    #[test]
    fn horizontal2(){
        let mut lobby = Lobby:: new(1,String::from(""),String::from(""));
        lobby.drop(2);
        lobby.drop(3);
        lobby.drop(3);
        lobby.drop(4);
        lobby.drop(4);
        lobby.drop(5);
        lobby.drop(5);
        lobby.drop(6);
        lobby.drop(6);
        assert!(lobby.end && lobby.turn == 2);
    }
    #[test]
    fn vertical2(){
        let mut lobby = Lobby:: new(1,String::from(""),String::from(""));
        lobby.drop(6);
        lobby.drop(5);
        lobby.drop(5);
        lobby.drop(6);
        lobby.drop(4);
        lobby.drop(5);
        lobby.drop(6);
        lobby.drop(5);
        lobby.drop(6);
        lobby.drop(5);
        lobby.drop(6);
        lobby.drop(5);
        assert!(lobby.end && lobby.turn == 2);
    }
    #[test]
    fn diagonal_right(){
        let mut lobby = Lobby:: new(1,String::from(""),String::from(""));
        lobby.drop(1);
        lobby.drop(2);
        lobby.drop(2);
        lobby.drop(3);
        lobby.drop(3);
        lobby.drop(4);
        lobby.drop(3);
        lobby.drop(4);
        lobby.drop(3);
        lobby.drop(4);
        lobby.drop(4);
        lobby.drop(4);
        assert!(lobby.end && lobby.turn == 1);
    }
    #[test]
    fn diagonal_left(){
        let mut lobby = Lobby:: new(1,String::from(""),String::from(""));
        lobby.drop(4);
        lobby.drop(3);
        lobby.drop(3);
        lobby.drop(2);
        lobby.drop(2);
        lobby.drop(1);
        lobby.drop(2);
        lobby.drop(1);
        lobby.drop(2);
        lobby.drop(1);
        lobby.drop(1);
        lobby.drop(1);
        assert!(lobby.end && lobby.turn == 1);
    }
}
