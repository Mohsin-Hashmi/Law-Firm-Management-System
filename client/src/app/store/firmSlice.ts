import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirmStats } from "../types/firm";

interface FirmState {
  firms: FirmStats[];
  loading: boolean;
  error: string | null;
}

const initialState: FirmState = {
  firms: [],
  loading: false,
  error: null,
};

const firmSlice = createSlice({
  name: "firm",
  initialState,
  reducers: {
    setFirm(state, action: PayloadAction<FirmStats>) {
      const index = state.firms.findIndex(f => f.firmId === action.payload.firmId);
      if (index !== -1) state.firms[index] = action.payload;
      else state.firms.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setFirm, setLoading, setError } = firmSlice.actions;
export default firmSlice.reducer;
