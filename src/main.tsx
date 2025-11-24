import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Unregister any service workers that might be interfering with API calls
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Service worker unregistered:', registration);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
