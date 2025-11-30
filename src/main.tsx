import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/store";

// ✅ Add this line
import { registerSW } from "virtual:pwa-register";

const rootElement = document.getElementById("root") as HTMLElement;

// ✅ Register service worker (PWA)
registerSW({ immediate: true });

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
