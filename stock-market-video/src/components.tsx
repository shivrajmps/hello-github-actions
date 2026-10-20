import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, random } from "remotion";
import { T, KEYWORDS } from "./design/tokens";

export type Phrase = { text: string; start: number; end: number };
export const PhraseCtx = createContext<Phrase[]>([]);
/** Frame (scene-relative) at which phrase i starts being spoken. */
export const useP = () => {
  const ps = useContext(PhraseCtx);
  return (i: number, offset = 0) => (ps[i]?.start ?? 0) + offset;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 spring that starts at frame `at`. */
export const useIn = (at: number, damping = 16, durationInFrames?: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, mass: 0.8 }, durationInFrames });
};
export const ramp = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1) });

/** Animated perspective floor grid + vignette + drifting gold dust. */
export const Backdrop: React.FC<{ hue?: string; floor?: boolean }> = ({ hue = T.gold, floor = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${T.bg2} 0%, ${T.bg} 70%)`, overflow: "hidden" }}>
      {floor && (
        <div style={{ position: "absolute", left: "50%", top: "58%", width: 5200, height: 2600, marginLeft: -2600, transform: "perspective(900px) rotateX(74deg)", transformOrigin: "50% 0%", backgroundImage: `linear-gradient(${T.line} 2px, transparent 2px), linear-gradient(90deg, ${T.line} 2px, transparent 2px)`, backgroundSize: "120px 120px", backgroundPosition: `0px ${(f * 1.6) % 120}px`, maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 75%)", WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 75%)" }} />
      )}
      {new Array(38).fill(0).map((_, i) => {
        const x = random(`x${i}`) * T.W;
        const y = (random(`y${i}`) * T.H - f * (0.25 + random(`s${i}`) * 0.6) + T.H * 4) % T.H;
        const s = 2 + random(`r${i}`) * 3;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: hue, opacity: 0.18 + random(`o${i}`) * 0.3, boxShadow: `0 0 ${s * 3}px ${hue}` }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

/** A CSS 3D cuboid. Positioned by its parent; children render on the front face. */
export const Box3D: React.FC<{ w: number; h: number; d: number; color: string; top?: string; side?: string; glow?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, d, color, top, side, glow = 0, children, style }) => {
  const face = (extra: React.CSSProperties): React.CSSProperties => ({ position: "absolute", left: 0, top: 0, backfaceVisibility: "hidden", ...extra });
  return (
    <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", ...style }}>
      <div style={face({ width: w, height: h, background: color, transform: `translateZ(${d / 2}px)`, boxShadow: glow ? `0 0 ${glow}px ${color}` : undefined, display: "flex", alignItems: "center", justifyContent: "center" })}>{children}</div>
      <div style={face({ width: w, height: h, background: side ?? color, filter: "brightness(0.45)", transform: `rotateY(180deg) translateZ(${d / 2}px)` })} />
      <div style={face({ width: d, height: h, background: side ?? color, filter: "brightness(0.6)", transform: `rotateY(90deg) translateZ(${w - d / 2}px)` })} />
      <div style={face({ width: d, height: h, background: side ?? color, filter: "brightness(0.6)", transform: `rotateY(-90deg) translateZ(${d / 2}px)` })} />
      <div style={face({ width: w, height: d, background: top ?? color, filter: top ? undefined : "brightness(1.25)", transform: `rotateX(90deg) translateZ(${d / 2}px)` })} />
      <div style={face({ width: w, height: d, background: color, filter: "brightness(0.3)", transform: `rotateX(-90deg) translateZ(${h - d / 2}px)` })} />
    </div>
  );
};

/** A 3D stage: everything inside shares one camera. */
export const Stage: React.FC<{ rx?: number; ry?: number; z?: number; children: React.ReactNode; persp?: number }> = ({ rx = 0, ry = 0, z = 0, children, persp = 1800 }) => (
  <AbsoluteFill style={{ perspective: persp, perspectiveOrigin: "50% 42%" }}>
    <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)` }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

export const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accent?: string }> = ({ children, style, accent = T.gold }) => (
  <div style={{ background: T.panel, border: `2px solid ${accent}55`, borderRadius: 22, boxShadow: `0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 ${accent}33`, padding: "22px 30px", color: T.white, fontFamily: T.font, ...style }}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties }> = ({ children, size = 40, color = T.white, weight = 700, style }) => (
  <div style={{ fontFamily: T.font, fontSize: size, fontWeight: weight, color, letterSpacing: -0.5, lineHeight: 1.1, ...style }}>{children}</div>
);

/** Arrow drawn progressively from (x1,y1) to (x2,y2). */
export const FlowArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; color?: string; dashed?: boolean; width?: number; curve?: number }> = ({ x1, y1, x2, y2, p, color = T.gold, dashed, width = 6, curve = 0 }) => {
  const f = useCurrentFrame();
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - curve;
  const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.15 + Math.abs(curve);
  const ang = Math.atan2(y2 - my, x2 - mx) * 180 / Math.PI;
  return (
    <svg width={T.W} height={T.H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={dashed ? "14 14" : `${len} ${len}`} strokeDashoffset={dashed ? -f * 2 : len * (1 - p)} opacity={dashed ? p : 1} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      {p > 0.98 && <polygon points="0,-14 26,0 0,14" fill={color} transform={`translate(${x2},${y2}) rotate(${ang})`} />}
    </svg>
  );
};

/** Caption bar: current phrase, keywords in gold. */
export const Captions: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const f = useCurrentFrame();
  const cur = phrases.find((p, i) => f >= p.start && f < (phrases[i + 1]?.start ?? p.end + 20));
  if (!cur) return null;
  const k = ramp(f, cur.start, cur.start + 6);
  const kw = [...KEYWORDS].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(?<![A-Za-z])(${kw.join("|")})(?![A-Za-z])`, "gi");
  const parts = cur.text.split(re);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 14}px)` }}>
      <div style={{ maxWidth: 1500, textAlign: "center", fontFamily: T.font, fontWeight: 800, fontSize: 50, lineHeight: 1.18, color: T.white, padding: "12px 32px", borderRadius: 18, background: "rgba(0,0,0,0.55)", textShadow: "0 3px 10px rgba(0,0,0,0.9)" }}>
        {parts.map((s, i) => (KEYWORDS.some((w) => w.toLowerCase() === s.toLowerCase()) ? <span key={i} style={{ color: T.goldHi }}>{s}</span> : <span key={i}>{s}</span>))}
      </div>
    </div>
  );
};

/** Persistent chapter chip (top-left) and chapter progress (top). */
export const Chrome: React.FC<{ chapter: string; index: number; count: number; globalFrame: number; total: number }> = ({ chapter, index, count, globalFrame, total }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 4, 18);
  return (
    <>
      <div style={{ position: "absolute", left: 56, top: 44, display: "flex", alignItems: "center", gap: 16, opacity: k, transform: `translateX(${(1 - k) * -30}px)` }}>
        <div style={{ width: 14, height: 14, borderRadius: 14, background: T.gold, boxShadow: `0 0 16px ${T.gold}` }} />
        <Label size={26} weight={600} color={T.muted} style={{ letterSpacing: 2, textTransform: "uppercase" }}>{`${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}</Label>
        <Label size={30} weight={700}>{chapter}</Label>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${(globalFrame / total) * 100}%`, background: `linear-gradient(90deg, ${T.goldDim}, ${T.gold})` }} />
    </>
  );
};

/** Simple person glyph. */
export const Person: React.FC<{ color?: string; size?: number }> = ({ color = T.white, size = 90 }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 100 110">
    <circle cx="50" cy="30" r="22" fill={color} />
    <path d="M10 108 C10 70 90 70 90 108 Z" fill={color} />
  </svg>
);

export const Coin: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <div style={{ width: size, height: size, borderRadius: size, background: `radial-gradient(circle at 35% 30%, ${T.goldHi}, ${T.gold} 55%, #8a6d12)`, boxShadow: `0 0 18px ${T.gold}88`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font, fontWeight: 900, fontSize: size * 0.55, color: "#3b2c00" }}>$</div>
);
