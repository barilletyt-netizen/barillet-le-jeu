import { S } from "../styles.js";

export default function Jauge({ label, val, max = 100 }) {
  return (
    <div>
      <span style={S.jauge}>{label}</span>
      <br />
      <span style={{ fontSize: 21 }}>{val}</span>
      <span style={S.steel}>/{max}</span>
    </div>
  );
}
