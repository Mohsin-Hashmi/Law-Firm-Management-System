
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client } from "../types/client";

export interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
      
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.push(action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const index = state.clients.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    deleteClient(state, action: PayloadAction<number>) {
      state.clients = state.clients.filter(
        (client) => client.id !== action.payload
      );
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearClients(state) {
      state.clients = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setClients,
  addClient,
  updateClient,
  deleteClient,
  setLoading,
  setError,
  clearClients,
} = clientSlice.actions;

export default clientSlice.reducer;
