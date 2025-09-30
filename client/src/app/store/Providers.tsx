"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useEffect } from "react";
import { initializeToken } from "../utils/tokenManager";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize token when app starts
    initializeToken();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
