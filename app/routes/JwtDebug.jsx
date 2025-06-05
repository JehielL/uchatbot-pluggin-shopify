// routes/JwtDebug.jsx
import React from "react";
import { useJwt } from "./JwtProvider";

export default function JwtDebug() {
  const { token } = useJwt();

  return (
    <div style={{ background: "#eee", padding: 20, borderRadius: 8, margin: 20 }}>
      <h3>DEBUG JWT TOKEN:</h3>
      <pre style={{ wordBreak: "break-all" }}>{token || "No token"}</pre>
    </div>
  );
}
