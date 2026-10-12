// store/slices/gameOverSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameWinner {
  id: string;
  name: string;
  avatar: string;
  socketId: string;
  isConnected: boolean;
  isEliminated: boolean;
  isReady: boolean;
  hasSubmitted: boolean;
  hasNetworkIssue: boolean;
  points: number;
}

interface GameOverState {
  isGameOver: boolean;
  winner: GameWinner | null;
}

const initialState: GameOverState = {
  isGameOver: false,
  winner: null,
};

const gameOverSlice = createSlice({
  name: "gameOver",
  initialState,
  reducers: {
    setGameOver(state, action: PayloadAction<GameWinner>) {
      console.log("isGameOver  yes", state);
      state.isGameOver = true;
      state.winner = action.payload;
    },
    resetGameOver(state) {
      console.log("isGameOver  null", state);
      state.isGameOver = false;
      state.winner = null;
    },
  },
});

export const { setGameOver, resetGameOver } = gameOverSlice.actions;
export default gameOverSlice.reducer;
