import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "Super Admin" | "Firm Admin" | "Lawyer" | "Assistant";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
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
  },
});
export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
