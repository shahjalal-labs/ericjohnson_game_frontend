import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Participant {
  id: string;
  name: string;
  avatar: string;

  isReady: boolean;
  isEliminated: boolean;
  isConnected: boolean;

  points: number;
  hasNetworkIssue: boolean;
  hasSubmitted: boolean;
}

interface ParticipantsState {
  players: Participant[];
}

const initialState: ParticipantsState = { players: [] };

const participantsSlice = createSlice({
  name: "participants",
  initialState,
  reducers: {
    setPlayers(state, action: PayloadAction<Participant[]>) {
      state.players = action.payload;
    },

    clearPlayers(state) {
      state.players = [];
    },
  },
});

export const { setPlayers, clearPlayers } = participantsSlice.actions;
export default participantsSlice.reducer;
