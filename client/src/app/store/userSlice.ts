import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id?: number;
  name?: string;
  email?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  firmId?: number; // current firm ID
  currentFirmId?: number; // optional
  firms?: { id: number; name: string }[]; // array of firms
  mustChangePassword?: boolean;
  permissions?: string[]; // Make optional since it might not be loaded initially
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  permissionsLoaded: boolean; // Track if permissions are loaded
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  permissionsLoaded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Loading state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // User management
    addUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
      // If user comes with permissions, mark as loaded
      if (action.payload.permissions) {
        state.permissionsLoaded = true;
      }
    },

    removeUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.permissionsLoaded = false;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Firm management
    switchFirm: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.firmId = action.payload;
        state.user.currentFirmId = action.payload;
        
      }
    },

    updateUserFirms: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      if (state.user) {
        const existingFirms = state.user.firms || [];
        const firmExists = existingFirms.some(
          (firm) => firm.id === action.payload.id
        );

        if (!firmExists) {
          state.user.firms = [...existingFirms, action.payload];
        }
      }
    },

    // Permission management
    updateUserPermissions: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.permissions = action.payload;
        state.permissionsLoaded = true;
        state.error = null;
      }
    },

    updateUserRole: (
      state,
      action: PayloadAction<{ role: string; permissions: string[] }>
    ) => {
      if (state.user) {
        state.user.role = action.payload.role;
        state.user.permissions = action.payload.permissions;
        state.permissionsLoaded = true;
      }
    },

    clearUserPermissions: (state) => {
      if (state.user) {
        state.user.permissions = [];
        state.permissionsLoaded = false;
      }
    },

    setPermissionsLoaded: (state, action: PayloadAction<boolean>) => {
      state.permissionsLoaded = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  addUser,
  removeUser,
  updateUser,
  switchFirm,
  updateUserFirms,
  updateUserPermissions,
  updateUserRole,
  clearUserPermissions,
  setPermissionsLoaded,
} = userSlice.actions;

export default userSlice.reducer;
