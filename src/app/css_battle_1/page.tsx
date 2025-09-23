import "./styles.css";

import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div className="spiral"></div>
    </div>
  );
}
