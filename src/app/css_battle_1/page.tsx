import "./styles.css";

import React from "react";

export default function page() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        // backgroundColor: "#f5d6b4",
      }}
    >
      <div className="battle-canvas">
        <div className="spiral-shape" />
      </div>
    </main>
  );
}
