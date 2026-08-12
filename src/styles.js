// UI « établi » validée en proto : vert nuit + laiton + ivoire, typo pixel.

export const S = {
  root: {
    background: "#0E140F", minHeight: "100vh", color: "#EDE6D6",
    fontFamily: "'VT323', monospace", fontSize: 19, lineHeight: 1.35,
    padding: "0 0 40px",
  },
  wrap: { maxWidth: 560, margin: "0 auto", padding: "0 14px" },
  h1: { fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#C9A227", lineHeight: 1.6 },
  h2: { fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "#C9A227", letterSpacing: 1, margin: "22px 0 10px" },
  h3: { fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#7A8A7C", letterSpacing: 1, margin: "14px 0 8px" },
  panel: { background: "#151D16", border: "2px solid #2A3A2C", borderRadius: 4, padding: 14, marginBottom: 12 },
  btn: (active) => ({
    display: "block", width: "100%", textAlign: "left",
    background: active ? "#243626" : "#151D16",
    border: active ? "2px solid #C9A227" : "2px solid #2A3A2C",
    borderRadius: 4, padding: "10px 12px", color: "#EDE6D6",
    fontFamily: "'VT323', monospace", fontSize: 18, cursor: "pointer", marginBottom: 8,
  }),
  action: (dispo) => ({
    background: dispo ? "#243626" : "#131813",
    border: "2px solid " + (dispo ? "#4A6B4E" : "#22301F"),
    borderRadius: 4, padding: "9px 12px",
    color: dispo ? "#EDE6D6" : "#5A6A5C",
    fontFamily: "'VT323', monospace", fontSize: 18,
    cursor: dispo ? "pointer" : "default", width: "100%", textAlign: "left", marginBottom: 7,
  }),
  gold: { color: "#C9A227" },
  steel: { color: "#9DA8A6", fontSize: 16 },
  red: { color: "#D06050" },
  green: { color: "#8FBF7F" },
  blue: { color: "#7AA8C8" },
  cta: {
    background: "#C9A227", color: "#0E140F", border: "none", borderRadius: 4,
    padding: "12px 18px", fontFamily: "'Press Start 2P', monospace", fontSize: 12,
    cursor: "pointer", width: "100%", marginTop: 12,
  },
  ghost: {
    background: "transparent", color: "#9DA8A6", border: "2px solid #2A3A2C",
    borderRadius: 4, padding: "8px 12px", fontFamily: "'VT323', monospace",
    fontSize: 17, cursor: "pointer", width: "100%", marginTop: 8,
  },
  input: {
    background: "#0E140F", border: "2px solid #2A3A2C", color: "#EDE6D6",
    fontFamily: "'VT323', monospace", fontSize: 18, padding: "6px 10px",
    borderRadius: 4, width: "100%",
  },
  num: {
    background: "#0E140F", border: "2px solid #2A3A2C", color: "#C9A227",
    fontFamily: "'VT323', monospace", fontSize: 18, padding: "4px 8px",
    borderRadius: 4, width: 90, textAlign: "right",
  },
  jauge: { fontSize: 16, color: "#9DA8A6" },
  lien: { color: "#C9A227", textDecoration: "underline" },

  // ---- Barre de statut persistante (bas d'écran, mobile d'abord) ----------
  barre: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
    background: "#121A13", borderTop: "2px solid #2A3A2C",
    // Encoche des iPhone : la barre ne doit pas passer sous le trait système.
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  barreContenu: {
    maxWidth: 560, margin: "0 auto", padding: "7px 14px",
    display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center",
  },
  barreLabel: { fontSize: 13, color: "#7A8A7C", letterSpacing: 0.5, lineHeight: 1.2 },
  barreValeur: { fontSize: 21, lineHeight: 1.1 },
  barreDelta: {
    position: "absolute", top: -14, left: 0,
    fontSize: 16, color: "#D06050",
    animation: "barillet-monte 1200ms ease-out forwards",
  },
  barreDetail: {
    maxWidth: 560, margin: "0 auto", padding: "0 14px 7px",
    fontSize: 14, color: "#7A8A7C", lineHeight: 1.3,
  },
  // Réserve la hauteur de la barre pour que le dernier bouton reste atteignable.
  espaceBarre: { height: 104 },
};
