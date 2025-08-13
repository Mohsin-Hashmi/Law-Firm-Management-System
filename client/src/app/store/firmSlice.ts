import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BillingInfo {
  card_number: string;
  expiry: string;        // e.g., "MM/YY"
  billing_address: string;
}

export interface Firm {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  subscription_plan: "Free" | "Basic" | "Premium";
  max_users: number;
  max_cases: number;
  status: "Active" | "Suspended" | "Cancelled";
  billing_info?: BillingInfo | null;
  trial_ends_at?: string | null;
}

interface FirmState {
  firms: Firm[];
  loading: boolean;
  error: string | null;
}

const initialState: FirmState = {
  firms: [],
  loading: false,
  error: null,
};

const firmSlice = createSlice({
  name: 'firm',
  initialState,
  reducers: {
    getFirms(state, action: PayloadAction<Firm[]>) {
      state.firms = action.payload;
    },
    addFirm(state, action: PayloadAction<Firm>) {
      state.firms.push(action.payload);
    },
    updateFirm(state, action: PayloadAction<Firm>) {
      const index = state.firms.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.firms[index] = action.payload;
      }
    },
    removeFirm(state, action: PayloadAction<number>) {
      state.firms = state.firms.filter(f => f.id !== action.payload);
    }
  },
});

export const {
  getFirms,
  addFirm,
  updateFirm,
  removeFirm,
} = firmSlice.actions;

export default firmSlice.reducer;
