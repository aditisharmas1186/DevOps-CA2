// Import polyfill for crypto.getRandomValues first
import "./lib/crypto-polyfill.js";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
