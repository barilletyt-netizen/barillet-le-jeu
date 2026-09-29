import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { MODE_CAPTURE, ZOOM_CAPTURE } from "./capture/mode.js";

// Mode capture : cadrage pour un enregistrement 1920×1080. La colonne du jeu,
// pensée mobile, est agrandie pour être lisible en vidéo, et les barres de
// défilement disparaissent de l'image.
if (MODE_CAPTURE) {
  document.documentElement.style.zoom = String(ZOOM_CAPTURE);
  const style = document.createElement("style");
  style.textContent =
    "html{scrollbar-width:none}html::-webkit-scrollbar{display:none}" +
    "body{-ms-overflow-style:none}";
  document.head.appendChild(style);
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
