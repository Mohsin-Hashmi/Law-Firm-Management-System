import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "Super Admin" | "Firm Admin" | "Lawyer" | "Assistant";

export interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
  firmId?: number; // current firm ID
  currentFirmId?: number; // optional
  firms?: { id: number; name: string }[]; // array of firms
  mustChangePassword?: boolean;
  permissions: string[];
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    removeUser: (state) => {
      state.user = null;
    },
    switchFirm: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.firmId = action.payload;
        state.user.currentFirmId = action.payload; // keep both in sync
      }
    },
    updateUserFirms: (state, action) => {
      if (state.user) {
        state.user.firms = [...(state.user.firms || []), action.payload];
      }
    },
  },
});
export const {setUser, addUser, removeUser, switchFirm, updateUserFirms } =
  userSlice.actions;
export default userSlice.reducer;
