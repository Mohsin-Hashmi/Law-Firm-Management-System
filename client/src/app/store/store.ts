import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";

import userReducer from "./userSlice";
import firmReducer from "./firmSlice";
import lawyerReducer from "./lawyerSlice";
import clientReducer from "./clientSlice";

// combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  firm: firmReducer,
  lawyer: lawyerReducer,
  client: clientReducer,
});

// persist config
const persistConfig = {
  key: "root",
  storage, // using localStorage
  whitelist: ["user", "firm", "lawyer", "client"], // choose which slices you want to persist
};

// create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

// create persistor
export const persistor = persistStore(store);

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
