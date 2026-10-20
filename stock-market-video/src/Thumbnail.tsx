import React from "react";
import { AbsoluteFill, random } from "remotion";
import { T } from "./design/tokens";
import { Box3D, Label } from "./components";

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 40%, #1a1608 0%, ${T.bg} 65%)`, overflow: "hidden" }}>
    <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: "70% 30%" }}>
      <div style={{ position: "absolute", left: 820, top: 640, transformStyle: "preserve-3d", transform: "rotateX(-14deg) rotateY(-26deg)" }}>
        {new Array(9).fill(0).map((_, i) => {
          const h = 120 + i * 48 + random(`t${i}`) * 60;
          return <div key={i} style={{ position: "absolute", transformStyle: "preserve-3d", transform: `translate3d(${(i - 4) * 70}px, ${-h}px, 0px)` }}><Box3D w={44} h={h} d={44} color={i === 5 ? T.red : T.green} glow={12} /></div>;
        })}
      </div>
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 700, top: 120, width: 250, height: 470, borderRadius: 40, background: "#0B0C10", border: `4px solid ${T.gold}`, boxShadow: `0 0 80px ${T.gold}55`, padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", transform: "rotate(-6deg)" }}>
      <Label size={44} weight={800} style={{ fontFamily: T.mono }}>$100</Label>
      <div style={{ flex: 1 }} />
      <div style={{ height: 90, borderRadius: 22, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 50px ${T.gold}` }}><Label size={50} weight={900} color="#1b1400">BUY</Label></div>
    </div>
    <div style={{ position: "absolute", left: 56, top: 70, width: 640 }}>
      <Label size={96} weight={900} style={{ fontFamily: T.display, lineHeight: 0.95, textShadow: "0 6px 20px #000" }}>What happens<br />after you<br />click <span style={{ color: T.goldHi }}>BUY?</span></Label>
      <div style={{ marginTop: 34, display: "inline-block", padding: "12px 22px", borderRadius: 14, background: T.gold }}><Label size={40} weight={900} color="#1b1400">STOCK MARKET · EXPLAINED</Label></div>
    </div>
  </AbsoluteFill>
);
