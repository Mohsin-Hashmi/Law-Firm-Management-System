import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import firmReducer from "./firmSlice";
import lawyerReducer from "./lawyerSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    firm: firmReducer,
    lawyer: lawyerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
