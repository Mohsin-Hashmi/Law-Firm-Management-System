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
  },
});
export const { addUser, removeUser, switchFirm } = userSlice.actions;
export default userSlice.reducer;
