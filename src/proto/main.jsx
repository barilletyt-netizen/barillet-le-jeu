import React from "react";
import { createRoot } from "react-dom/client";
import BarilletProto from "./BarilletProto.jsx";
import { ZOOM_CAPTURE } from "../capture/mode.js";

// Le prototype est servi pour être filmé à côté du jeu actuel, en
// split-screen. Même agrandissement que le mode capture, pour que les deux
// colonnes aient exactement la même largeur à l'image.
document.documentElement.style.zoom = String(ZOOM_CAPTURE);
const style = document.createElement("style");
style.textContent =
  "html{scrollbar-width:none}html::-webkit-scrollbar{display:none}body{margin:0;background:#0e140f}";
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BarilletProto />
  </React.StrictMode>
);
