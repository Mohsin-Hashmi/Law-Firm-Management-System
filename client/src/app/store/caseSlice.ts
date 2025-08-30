// store/caseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Case } from "../types/case";

export interface CaseState {
  cases: Case[];
  loading: boolean;
  error: string | null;
}

const initialState: CaseState = {
  cases: [],
  loading: false,
  error: null,
};
  
const caseSlice = createSlice({
  name: "case",
  initialState,
  reducers: {
    setCases(state, action: PayloadAction<Case[]>) {
      state.cases = action.payload;
    },
    addCase(state, action: PayloadAction<Case>) {
      state.cases.push(action.payload);
    },
    updateCase(state, action: PayloadAction<Case>) {
      const index = state.cases.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = action.payload;
      }
    },
    deleteCase(state, action: PayloadAction<number>) {
      state.cases = state.cases.filter((c) => c.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearCases(state) {
      state.cases = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setCases,
  addCase,
  updateCase,
  deleteCase,
  setLoading,
  setError,
  clearCases,
} = caseSlice.actions;

export default caseSlice.reducer;
