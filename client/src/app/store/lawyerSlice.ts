import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Lawyer } from "../types/firm";

export interface LawyerState {
  lawyers: Lawyer[];
  loading: boolean;
  error: string | null;
}

const initialState: LawyerState = {
  lawyers: [],
  loading: false,
  error: null,
};

const lawyerSlice = createSlice({
  name: "lawyer",
  initialState,
  reducers: {
    setLawyers(state, action: PayloadAction<Lawyer[]>) {
      state.lawyers = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearLawyers(state) {
      state.lawyers = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLawyers, setLoading, setError, clearLawyers } =
  lawyerSlice.actions;
export default lawyerSlice.reducer;
