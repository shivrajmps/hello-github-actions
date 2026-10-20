import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { T } from "../design/tokens";
import { Box3D, Coin, FlowArrow, Glass, Label, Person, Stage, clamp, ramp, useIn, useP } from "../components";

/* 1 — HOOK: 3D candlestick skyline, the "Buy" tap, title. */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const cityOut = ramp(f, at(2) - 6, at(2) + 10);
  const phoneIn = useIn(at(2));
  const tap = at(3) + 34;
  const pressed = f >= tap && f < tap + 8;
  const ripple = ramp(f, tap, tap + 22);
  const titleIn = useIn(at(4) - 4, 14);
  const phoneShift = ramp(f, at(4) - 6, at(4) + 14);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - cityOut * 0.75 }}>
        <Stage rx={-16} ry={interpolate(f, [0, 420], [-28, 14])} z={-200}>
          <div style={{ position: "absolute", left: 960, top: 700, transformStyle: "preserve-3d" }}>
            {new Array(15).fill(0).map((_, i) => {
              const up = random(`c${i}`) > 0.3;
              const h = (90 + i * 26 + random(`h${i}`) * 90) * ramp(f, i * 3, i * 3 + 22);
              const col = up ? T.green : T.red;
              return (
                <div key={i} style={{ position: "absolute", transformStyle: "preserve-3d", transform: `translate3d(${(i - 7) * 110 - 30}px, ${-h}px, ${(random(`z${i}`) - 0.5) * 260}px)` }}>
                  <Box3D w={60} h={Math.max(h, 1)} d={60} color={col} glow={10} />
                </div>
              );
            })}
          </div>
        </Stage>
      </div>
      {/* "billions of shares" call-out */}
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", opacity: ramp(f, at(1), at(1) + 10) * (1 - cityOut) }}>
        <Label size={124} weight={900} color={T.goldHi} style={{ fontFamily: T.display, textShadow: `0 0 40px ${T.gold}88` }}>BILLIONS</Label>
        <Label size={46} weight={600}>of shares traded every day</Label>
      </div>
      {/* phone + Buy */}
      <div style={{ position: "absolute", left: 960 - 190, top: 150, width: 380, height: 700, transform: `translateX(${-phoneShift * 520}px) scale(${phoneIn * (1 - phoneShift * 0.18)}) rotateY(${(1 - phoneIn) * 50}deg)`, opacity: phoneIn }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 54, background: "#0B0C10", border: `3px solid ${T.goldDim}`, boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 60px ${T.gold}22`, padding: 34, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18 }}>
          <Label size={26} color={T.muted} weight={600}>ACME Corp · ACME</Label>
          <Label size={72} weight={800} style={{ fontFamily: T.mono }}>$100.00</Label>
          <svg width="312" height="200" viewBox="0 0 312 200">
            <polyline fill="none" stroke={T.green} strokeWidth="5" points="0,170 30,150 60,160 90,120 120,130 150,95 180,105 210,70 240,80 270,45 312,30" />
          </svg>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative", height: 110, borderRadius: 26, background: pressed ? T.goldHi : T.gold, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pressed ? 0.94 : 1})`, boxShadow: `0 0 ${30 + ripple * 40}px ${T.gold}` }}>
            <Label size={56} weight={900} color="#1b1400">BUY</Label>
            {ripple > 0 && ripple < 1 && <div style={{ position: "absolute", width: 60 + ripple * 360, height: 60 + ripple * 360, borderRadius: 999, border: `4px solid ${T.goldHi}`, opacity: 1 - ripple }} />}
          </div>
        </div>
        {f >= tap - 12 && f < tap + 16 && <div style={{ position: "absolute", left: 190 - 34, top: 590 + (f < tap ? (tap - f) * 6 : 0), width: 68, height: 68, borderRadius: 68, background: "rgba(255,255,255,0.35)", border: "3px solid white" }} />}
      </div>
      {/* order light-streak */}
      {f > tap && <FlowArrow x1={960} y1={700} x2={1800} y2={180} p={ramp(f, tap, tap + 18) * (1 - phoneShift)} curve={260} />}
      {/* title */}
      <div style={{ position: "absolute", left: 760, top: 300, width: 1100, opacity: titleIn, transform: `perspective(1200px) rotateY(${(1 - titleIn) * -35}deg) translateX(${(1 - titleIn) * 80}px)` }}>
        <Label size={34} weight={700} color={T.gold} style={{ letterSpacing: 8 }}>STEP BY STEP</Label>
        <Label size={118} weight={900} style={{ fontFamily: T.display, lineHeight: 0.98, marginTop: 10 }}>How the Stock<br />Market <span style={{ color: T.goldHi }}>Works</span></Label>
        <div style={{ width: 300 * ramp(f, at(5), at(5) + 20), height: 6, background: T.gold, marginTop: 28, boxShadow: `0 0 20px ${T.gold}` }} />
      </div>
    </AbsoluteFill>
  );
};

/* 2 — WHAT IS A STOCK / IPO */
const GX = 5, GY = 4;
export const Stock: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const blockIn = useIn(at(0));
  const explode = ramp(f, at(3), at(3) + 24);
  const slice = ramp(f, at(1) + 8, at(1) + 24) * (1 - ramp(f, at(3) - 6, at(3) + 6));
  const sold = [2, 7, 9, 12, 16, 18];
  const sellP = ramp(f, at(4), at(4) + 30);
  const ipo = useIn(at(5));
  const cash = ramp(f, at(7), at(7) + 30);
  const second = Math.max(0, f - at(8));
  const investors = [{ x: 1340, y: 380 }, { x: 1560, y: 560 }, { x: 1340, y: 740 }];
  return (
    <AbsoluteFill>
      <Stage rx={-14} ry={interpolate(f, [0, 700], [26, 10])}>
        <div style={{ position: "absolute", left: 520, top: 690, transformStyle: "preserve-3d", transform: `scale(${blockIn})` }}>
          {new Array(GX * GY).fill(0).map((_, i) => {
            const cx = i % GX, cy = Math.floor(i / GX);
            const gap = 4 + explode * 26;
            const isSold = sold.includes(i);
            const gone = isSold ? sellP : 0;
            const pop = i === 7 ? slice : 0;
            return (
              <div key={i} style={{ position: "absolute", transformStyle: "preserve-3d", opacity: 1 - gone, transform: `translate3d(${(cx - GX / 2) * (64 + gap)}px, ${-(cy + 1) * (64 + gap)}px, ${pop * 160}px) scale(${1 + pop * 0.15})` }}>
                <Box3D w={64} h={64} d={64} color={pop > 0.1 ? T.goldHi : "#2a2410"} side={T.gold} top={T.goldDim} glow={pop * 30} />
              </div>
            );
          })}
        </div>
      </Stage>
      <div style={{ position: "absolute", left: 300, top: 760, width: 460, textAlign: "center", opacity: blockIn }}>
        <Label size={40} weight={800}>{explode > 0.5 ? "Millions of shares" : "A company"}</Label>
      </div>
      {slice > 0.05 && (
        <Glass style={{ position: "absolute", left: 640, top: 210, opacity: slice, padding: "16px 24px" }}>
          <Label size={34} weight={700}>1 share = <span style={{ color: T.goldHi }}>a slice of ownership</span></Label>
        </Glass>
      )}
      {/* investors */}
      {investors.map((p, k) => (
        <div key={k} style={{ position: "absolute", left: p.x - 45, top: p.y - 50, opacity: ramp(f, at(4) - 10 + k * 4, at(4) + 6 + k * 4) }}>
          <Person color={k === 1 ? T.goldHi : T.white} />
        </div>
      ))}
      {/* shares flying to the public */}
      {sold.map((s, k) => {
        const p = ramp(f, at(4) + k * 3, at(4) + 26 + k * 3);
        if (p <= 0 || p >= 1) return null;
        const t = investors[k % 3];
        return <div key={s} style={{ position: "absolute", left: interpolate(p, [0, 1], [560, t.x - 20]), top: interpolate(p, [0, 1], [430, t.y + 40]) - Math.sin(p * Math.PI) * 140, width: 38, height: 38, background: T.goldHi, borderRadius: 6, boxShadow: `0 0 20px ${T.gold}` }} />;
      })}
      {/* cash back to company */}
      {[0, 1, 2].map((k) => {
        const p = ramp(f, at(7) + k * 5, at(7) + 30 + k * 5);
        if (p <= 0 || p >= 1) return null;
        return <div key={k} style={{ position: "absolute", left: interpolate(p, [0, 1], [investors[k].x - 20, 560]), top: interpolate(p, [0, 1], [investors[k].y, 480]) - Math.sin(p * Math.PI) * 100 }}><Coin size={58} /></div>;
      })}
      {cash > 0.95 && f < at(8) + 10 && <Glass style={{ position: "absolute", left: 360, top: 200, padding: "14px 22px" }}><Label size={34}>IPO cash → <span style={{ color: T.goldHi }}>the company</span></Label></Glass>}
      {/* IPO badge */}
      <div style={{ position: "absolute", left: 780, top: 150, opacity: ipo * (1 - ramp(f, at(8) - 6, at(8) + 6)), transform: `scale(${0.6 + ipo * 0.4})` }}>
        <Glass style={{ textAlign: "center", padding: "18px 40px" }}>
          <Label size={96} weight={900} color={T.goldHi} style={{ fontFamily: T.display }}>IPO</Label>
          <Label size={30} weight={600} color={T.muted} style={{ opacity: ramp(f, at(6), at(6) + 10) }}>Initial Public Offering</Label>
        </Glass>
      </div>
      {/* secondary market: shares hop between investors */}
      {f > at(8) && [0, 1, 2, 3].map((k) => {
        const cyc = ((second + k * 11) % 44) / 44;
        const a = investors[k % 3], b = investors[(k + 1) % 3];
        return <div key={k} style={{ position: "absolute", left: interpolate(cyc, [0, 1], [a.x, b.x]) - 15, top: interpolate(cyc, [0, 1], [a.y, b.y]) - Math.sin(cyc * Math.PI) * 90 + 20, width: 30, height: 30, borderRadius: 6, background: T.goldHi, opacity: 0.9 }} />;
      })}
      {f > at(8) && (
        <Glass style={{ position: "absolute", left: 1180, top: 120, opacity: ramp(f, at(8), at(8) + 12), textAlign: "center" }}>
          <Label size={28} color={T.muted} weight={600}>Investors ⇄ Investors</Label>
          <Label size={44} weight={800} color={f > at(9) ? T.goldHi : T.white}>{f > at(9) ? "= The Stock Market" : "Secondary market"}</Label>
        </Glass>
      )}
    </AbsoluteFill>
  );
};

/* 3 — EXCHANGE, BROKER, REGULATOR */
export const Players: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const ex = useIn(at(0));
  const you = useIn(at(2) - 4);
  const broker = useIn(at(3));
  const reg = useIn(at(5));
  const chipP = ramp(f, at(4), at(4) + 40);
  const node = (x: number, y: number, k: number, title: string, sub: string, color = T.white) => (
    <div style={{ position: "absolute", left: x - 150, top: y, width: 300, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
      <Label size={40} weight={800} color={color}>{title}</Label>
      <Label size={24} weight={500} color={T.muted} style={{ marginTop: 6 }}>{sub}</Label>
    </div>
  );
  const badges = ["NYSE", "Nasdaq", "NSE"];
  return (
    <AbsoluteFill>
      {/* exchange building (3D) */}
      <Stage rx={-10} ry={interpolate(f, [0, 600], [-24, -8])}>
        <div style={{ position: "absolute", left: 1400, top: 600, transformStyle: "preserve-3d", transform: `scaleY(${ex})`, transformOrigin: "bottom" }}>
          <div style={{ position: "absolute", transformStyle: "preserve-3d", transform: "translate3d(0px,-230px,0px)" }}>
            <Box3D w={300} h={230} d={160} color="#1c1a12" side={T.gold} top={T.gold}>
              <div style={{ display: "flex", gap: 26 }}>{[0, 1, 2, 3, 4].map((c) => <div key={c} style={{ width: 22, height: 160, background: `linear-gradient(${T.goldHi}, ${T.gold})`, borderRadius: 4 }} />)}</div>
            </Box3D>
          </div>
          <div style={{ position: "absolute", transformStyle: "preserve-3d", transform: "translate3d(-20px,-290px,0px)" }}>
            <Box3D w={340} h={60} d={190} color={T.gold} glow={20} />
          </div>
        </div>
      </Stage>
      {node(1560, 640, ex, "EXCHANGE", "where buyers meet sellers", T.goldHi)}
      <div style={{ position: "absolute", left: 1375, top: 750, display: "flex", gap: 14 }}>
        {badges.map((b, i) => (
          <div key={b} style={{ opacity: ramp(f, at(1) + i * 12, at(1) + i * 12 + 8), transform: `scale(${0.7 + 0.3 * ramp(f, at(1) + i * 12, at(1) + i * 12 + 8)})`, padding: "8px 18px", borderRadius: 12, border: `2px solid ${T.gold}`, fontFamily: T.font, fontWeight: 800, fontSize: 28, color: T.white, background: T.panel }}>{b}</div>
        ))}
      </div>
      {/* you */}
      <div style={{ position: "absolute", left: 260, top: 380, opacity: you, transform: `scale(${you})` }}><Person color={T.goldHi} size={120} /></div>
      {node(320, 530, you, "YOU", "the investor")}
      {/* direct route blocked */}
      {f > at(2) && f < at(3) + 20 && (
        <>
          <FlowArrow x1={400} y1={420} x2={1340} y2={420} p={ramp(f, at(2), at(2) + 18)} color={T.red} curve={-160} />
          <div style={{ position: "absolute", left: 870, top: 210, opacity: ramp(f, at(2) + 16, at(2) + 22), fontSize: 120, fontWeight: 900, color: T.red, fontFamily: T.font }}>✕</div>
        </>
      )}
      {/* broker */}
      <div style={{ position: "absolute", left: 960 - 80, top: 360, width: 160, height: 160, borderRadius: 34, background: T.panel, border: `3px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: broker, transform: `scale(${broker}) perspective(600px) rotateY(${(1 - broker) * 90}deg)`, boxShadow: `0 0 40px ${T.gold}44` }}>
        <svg width="90" height="90" viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2.5" fill="none" stroke={T.goldHi} strokeWidth="1.6" /><circle cx="12" cy="18.5" r="1" fill={T.goldHi} /><polyline points="8.5,12 10.5,9.5 12.5,11 15.5,7" fill="none" stroke={T.green} strokeWidth="1.5" /></svg>
      </div>
      {node(960, 540, broker, "BROKER", ramp(f, at(4), at(4) + 8) > 0.5 ? "licensed app or firm" : "")}
      {f > at(3) && <FlowArrow x1={400} y1={440} x2={860} y2={440} p={ramp(f, at(3) + 6, at(3) + 20)} />}
      {f > at(3) && <FlowArrow x1={1060} y1={440} x2={1340} y2={440} p={ramp(f, at(3) + 18, at(3) + 32)} />}
      {chipP > 0 && chipP < 1 && (
        <div style={{ position: "absolute", left: interpolate(chipP, [0, 1], [380, 1340]), top: 400, padding: "6px 14px", borderRadius: 10, background: T.gold, color: "#1b1400", fontFamily: T.font, fontWeight: 900, fontSize: 24 }}>ORDER</div>
      )}
      {/* regulator */}
      <div style={{ position: "absolute", left: 960 - 330, top: 110, width: 660, height: 140, opacity: reg, transform: `translateY(${(1 - reg) * -60}px)` }}>
        <Glass style={{ display: "flex", alignItems: "center", gap: 26, padding: "18px 28px" }}>
          <svg width="80" height="90" viewBox="0 0 24 27"><path d="M12 1 L22 5 V12 C22 19 17 24 12 26 C7 24 2 19 2 12 V5 Z" fill={T.gold} /><path d="M7.5 13 L11 16.5 L17 9.5" stroke="#1b1400" strokeWidth="2.4" fill="none" /></svg>
          <div>
            <Label size={40} weight={800}>REGULATOR</Label>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {[["SEC", "US"], ["SEBI", "India"]].map(([a, b], i) => (
                <div key={a} style={{ opacity: ramp(f, at(6) + i * 14, at(6) + i * 14 + 8), fontFamily: T.font, fontSize: 28, fontWeight: 800, color: T.goldHi }}>{a} <span style={{ color: T.muted, fontWeight: 500 }}>· {b}</span></div>
              ))}
            </div>
          </div>
        </Glass>
      </div>
      {f > at(5) && [400, 960, 1560].map((x, i) => (
        <svg key={i} width={T.W} height={T.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={960} y1={262} x2={x} y2={i === 1 ? 350 : 370} stroke={T.gold} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-f} opacity={ramp(f, at(5) + 8, at(5) + 20) * 0.7} />
        </svg>
      ))}
      {f > at(7) && <div style={{ position: "absolute", left: 1320, top: 150, opacity: ramp(f, at(7), at(7) + 10) }}><Label size={34} color={T.green}>✓ rules enforced</Label></div>}
    </AbsoluteFill>
  );
};
