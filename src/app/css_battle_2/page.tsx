import "./styles.css";

import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <main className="battle-canvas">
      <div className="circle yellow"></div>
      <div className="circle red"></div>
    </main>
  );
}
