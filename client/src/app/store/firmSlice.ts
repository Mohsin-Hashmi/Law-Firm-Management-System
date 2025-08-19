import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirmStats } from "../types/firm";

export interface FirmState {
  firm?: FirmStats; // single firm
  loading: boolean;
  error: string | null;
}

const initialState: FirmState = {
  firm: undefined,
  loading: false,
  error: null,
};

const firmSlice = createSlice({
  name: "firm",
  initialState,
  reducers: {
    setFirm(state, action: PayloadAction<FirmStats>) {
      state.firm = action.payload; // now valid
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
