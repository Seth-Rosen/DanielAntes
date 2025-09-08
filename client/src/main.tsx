import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./scroll-guard";

createRoot(document.getElementById("root")!).render(<App />);
