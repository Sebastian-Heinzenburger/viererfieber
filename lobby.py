import numpy as np
import random

class lobby:
	TURN = 1
	ROW_COUNT = 6
	COLUMN_COUNT = 7
	FIELD = None
	END = False
	LOBBY_ID = None
	PLAYER1_NAME = None
	PLAYER2_NAME = None
	PLAYER1_SID = None
	PLAYER2_SID = None

	def init(self, lobby_id):
		self.FIELD = np.zeros((self.ROW_COUNT,self.COLUMN_COUNT))
		self.LOBBY_ID = lobby_id

	def drop(self, column):
		if(self.FIELD[self.ROW_COUNT-1][column] == 0):
			for row in range(self.ROW_COUNT):
				if self.FIELD[row][column] == 0:
					self.FIELD[row][column] = self.TURN
					if(self.is_game_won()):
						self.END = True
					else:	
						if(self.TURN == 1):
							self.TURN = 2
						else:
							self.TURN = 1 
					break
		else:
			print("Invalid location")

	def bot_move(self):
		column = random.randint(0,self.COLUMN_COUNT)
		while self.FIELD[self.ROW_COUNT-1][column] != 0:
			column = random.randrange(0,self.COLUMN_COUNT)
		return column

	def is_game_won(self):
		for c in range(self.COLUMN_COUNT-3): #Horizontal
			for r in range(self.ROW_COUNT):
				if self.FIELD[r][c] == self.TURN and self.FIELD[r][c+1] == self.TURN and self.FIELD[r][c+2] == self.TURN and self.FIELD[r][c+3] == self.TURN:
					return True

		for c in range(self.COLUMN_COUNT): #Vertical
			for r in range(self.ROW_COUNT-3):
				if self.FIELD[r][c] == self.TURN and self.FIELD[r+1][c] == self.TURN and self.FIELD[r+2][c] == self.TURN and self.FIELD[r+3][c] == self.TURN:
					return True

		for c in range(self.COLUMN_COUNT-3): #Diagonal top right
			for r in range(self.ROW_COUNT-3):
				if self.FIELD[r][c] == self.TURN and self.FIELD[r+1][c+1] == self.TURN and self.FIELD[r+2][c+2] == self.TURN and self.FIELD[r+3][c+3] == self.TURN:
					return True

		for c in range(self.COLUMN_COUNT-3): #Diagonal top left
			for r in range(3, self.ROW_COUNT):
				if self.FIELD[r][c] == self.TURN and self.FIELD[r-1][c+1] == self.TURN and self.FIELD[r-2][c+2] == self.TURN and self.FIELD[r-3][c+3] == self.TURN:
					return True

instance = lobby()
instance.init()