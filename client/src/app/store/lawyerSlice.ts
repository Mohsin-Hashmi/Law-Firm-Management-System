import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Lawyer } from "../types/firm";
import { LawyerStats } from "../types/lawyer";

export interface LawyerState {
  lawyers: Lawyer[];
  stats?: LawyerStats;
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
    addLawyerReducer(state, action: PayloadAction<Lawyer>) {
      const exists = state.lawyers.find((l) => l.id === action.payload.id);
      if (!exists) {
        state.lawyers.push(action.payload);
      }
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
    setLawyerStats: (state, action: PayloadAction<LawyerStats>) => {
      state.stats = action.payload;
    },
  },
});

export const {
  setLawyers,
  addLawyerReducer,
  setLoading,
  setError,
  clearLawyers,
  setLawyerStats,
} = lawyerSlice.actions;
export default lawyerSlice.reducer;
