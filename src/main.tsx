import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: "#333",
          width: "250px",
          color: "#fff",
          fontSize: "18px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#713200",
          secondary: "#FFFAEE",
        },
        duration: 4000,
      }}
    />
  </StrictMode>
);
