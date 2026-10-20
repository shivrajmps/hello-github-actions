import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { T } from "../design/tokens";
import { Box3D, Coin, FlowArrow, Glass, Label, Person, Stage, clamp, ramp, useIn, useP } from "../components";

/* 4 — ORDER BOOK (illustrative numbers; arithmetic checked in scripts/verify.mjs) */
export const BIDS = [[99.0, 500], [98.5, 1200], [98.0, 800], [97.5, 2000]] as const;
export const ASKS = [[100.0, 400], [100.5, 900], [101.0, 1500], [101.5, 700]] as const;
export const ORDER_QTY = 100;
const fmt = (n: number) => n.toLocaleString("en-US");

export const OrderBook: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const panel = useIn(at(1) - 4);
  const filled = f > at(9) + 34;
  const limitIn = f > at(10) + 30;
  const maxQ = 2000;
  const row = (side: "bid" | "ask", i: number, price: number, qty: number) => {
    const start = side === "bid" ? at(2) + i * 5 : at(4) + i * 5;
    const k = ramp(f, start, start + 10);
    const best = i === 0;
    const hl = best && (side === "bid" ? f > at(3) + 10 : f > at(5) + 10);
    const pulse = best && ((side === "bid" && f > at(6) && f < at(7)) || (side === "ask" && f > at(7) && f < at(8))) ? 1 + 0.06 * Math.sin(f / 3) : 1;
    let q: string = fmt(qty);
    if (side === "ask" && best && filled) q = fmt(qty - ORDER_QTY);
    if (side === "bid" && best && limitIn) q = `${fmt(qty)} + ${ORDER_QTY}`;
    const col = side === "bid" ? T.green : T.red;
    return (
      <div key={i} style={{ position: "relative", height: 78, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", marginBottom: 10, borderRadius: 14, opacity: k, transform: `translateX(${(1 - k) * (side === "bid" ? -40 : 40)}px) scale(${pulse})`, background: hl ? `${col}22` : "rgba(255,255,255,0.03)", border: hl ? `3px solid ${col}` : "3px solid transparent", boxShadow: hl ? `0 0 30px ${col}55` : undefined }}>
        <div style={{ position: "absolute", top: 8, bottom: 8, [side === "bid" ? "right" : "left"]: 0, width: `${(qty / maxQ) * 60 * k}%`, background: `${col}26`, borderRadius: 10 }} />
        <Label size={40} weight={800} color={col} style={{ fontFamily: T.mono, position: "relative" }}>${price.toFixed(2)}</Label>
        <Label size={32} weight={600} color={T.white} style={{ fontFamily: T.mono, position: "relative" }}>{q}</Label>
      </div>
    );
  };
  const mk = ramp(f, at(9) + 6, at(9) + 34);
  const lim = ramp(f, at(10) + 4, at(10) + 30);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
        <div style={{ position: "absolute", left: 300, top: 120, width: 1320, opacity: panel, transform: `rotateX(${14 - panel * 4}deg) rotateY(${interpolate(f, [0, 900], [-7, 5])}deg) scale(${0.85 + panel * 0.15})`, transformOrigin: "50% 60%" }}>
          <Glass style={{ padding: "26px 34px 30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <Label size={40} weight={900} style={{ letterSpacing: 2 }}>ORDER BOOK · <span style={{ color: T.goldHi }}>ACME</span></Label>
              <Label size={22} weight={500} color={T.muted}>illustrative prices &amp; sizes</Label>
            </div>
            <div style={{ display: "flex", gap: 210, position: "relative" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 26px 10px", opacity: ramp(f, at(2), at(2) + 8) }}>
                  <Label size={28} color={T.green} weight={800}>BUYERS · BID</Label><Label size={24} color={T.muted} weight={600}>shares</Label>
                </div>
                {BIDS.map(([p, q], i) => row("bid", i, p, q))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 26px 10px", opacity: ramp(f, at(4), at(4) + 8) }}>
                  <Label size={28} color={T.red} weight={800}>SELLERS · ASK</Label><Label size={24} color={T.muted} weight={600}>shares</Label>
                </div>
                {ASKS.map(([p, q], i) => row("ask", i, p, q))}
              </div>
              {/* spread bracket */}
              <div style={{ position: "absolute", left: "50%", top: 46, width: 170, textAlign: "center", transform: `translateX(-50%) scale(${ramp(f, at(8), at(8) + 12)})`, padding: "8px 0", borderRadius: 14, background: T.gold, color: "#1b1400", fontFamily: T.font, fontWeight: 900, fontSize: 26, lineHeight: 1.1, boxShadow: `0 0 30px ${T.gold}` }}>
                ◀ SPREAD ▶<br />$1.00
              </div>
            </div>
          </Glass>
        </div>
      </div>
      {/* annotations */}
      {f > at(3) + 10 && f < at(8) && <Glass style={{ position: "absolute", left: 330, top: 760, padding: "12px 22px", opacity: ramp(f, at(3) + 10, at(3) + 20) }}><Label size={30}><span style={{ color: T.green }}>Bid</span> = highest price a buyer will pay</Label></Glass>}
      {f > at(5) + 10 && f < at(8) && <Glass style={{ position: "absolute", left: 1000, top: 760, padding: "12px 22px", opacity: ramp(f, at(5) + 10, at(5) + 20) }}><Label size={30}><span style={{ color: T.red }}>Ask</span> = lowest price a seller will take</Label></Glass>}
      {f > at(8) && f < at(9) && <Glass style={{ position: "absolute", left: 640, top: 760, padding: "12px 22px", opacity: ramp(f, at(8) + 6, at(8) + 16) }}><Label size={34} style={{ fontFamily: T.mono }}>$100.00 − $99.00 = <span style={{ color: T.goldHi }}>$1.00 spread</span></Label></Glass>}
      {/* market order chip → best ask */}
      {f > at(9) && f < at(10) + 10 && (
        <>
          <div style={{ position: "absolute", left: interpolate(mk, [0, 1], [860, 1000]), top: interpolate(mk, [0, 1], [880, 300]), padding: "10px 18px", borderRadius: 12, background: T.gold, color: "#1b1400", fontFamily: T.font, fontWeight: 900, fontSize: 28, opacity: filled ? 0 : 1 }}>MARKET BUY · {ORDER_QTY} sh</div>
          {filled && <div style={{ position: "absolute", left: 1010, top: 760, transform: `rotate(-4deg) scale(${ramp(f, at(9) + 34, at(9) + 42, 1.6, 1)})`, padding: "10px 22px", border: `5px solid ${T.green}`, borderRadius: 14, color: T.green, fontFamily: T.font, fontWeight: 900, fontSize: 44, background: "rgba(0,0,0,0.6)" }}>FILLED @ $100.00</div>}
        </>
      )}
      {/* limit order chip → joins bid queue */}
      {f > at(10) && (
        <>
          <div style={{ position: "absolute", left: interpolate(lim, [0, 1], [700, 420]), top: interpolate(lim, [0, 1], [880, 300]), padding: "10px 18px", borderRadius: 12, background: T.white, color: "#111", fontFamily: T.font, fontWeight: 900, fontSize: 28, opacity: limitIn ? 0 : 1 }}>LIMIT BUY {ORDER_QTY} @ $99</div>
          {limitIn && <Glass style={{ position: "absolute", left: 330, top: 760, padding: "12px 22px" }}><Label size={32}>In the queue at $99 — <span style={{ color: T.goldHi }}>behind 500 shares</span>{f > at(11) ? <span style={{ color: T.muted }}>{" · waiting" + ".".repeat(1 + (Math.floor(f / 10) % 3))}</span> : null}</Label></Glass>}
        </>
      )}
    </AbsoluteFill>
  );
};

/* 5 — MATCHING ENGINE + PRICE DISCOVERY */
const Gear: React.FC<{ size: number; rot: number }> = ({ size, rot }) => {
  const teeth = 12;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 ? 40 : 48;
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    pts.push(`${50 + r * Math.cos(a0)},${50 + r * Math.sin(a0)}`, `${50 + r * Math.cos(a1)},${50 + r * Math.sin(a1)}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 0 18px ${T.gold})` }}>
      <polygon points={pts.join(" ")} fill={T.gold} />
      <circle cx="50" cy="50" r="22" fill={T.bg} />
      <circle cx="50" cy="50" r="12" fill="none" stroke={T.goldHi} strokeWidth="3" />
    </svg>
  );
};

export const Matching: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const shift = ramp(f, at(4), at(4) + 22);
  const chartIn = useIn(at(5) - 6);
  const t0 = at(5);
  // Illustrative price path: flat around 100, buyers push to 101.50, sellers push to 99.50.
  const price = (fr: number) => {
    const up = ramp(fr, at(6), at(8), 0, 1.5);
    const dn = ramp(fr, at(8), at(10), 0, 2.0);
    const noise = (random(`n${Math.floor(fr / 4)}`) - 0.5) * 0.18;
    return Math.round((100 + up - dn + noise) / 0.05) * 0.05;
  };
  const span = at(10) + 60 - t0;
  const pts: string[] = [];
  for (let fr = t0; fr <= Math.min(f, at(10) + 60); fr += 4) pts.push(`${((fr - t0) / span) * 900},${(102 - price(fr)) * 120}`);
  const last = price(Math.max(t0, f));
  const prev = price(Math.max(t0, f - 8));
  const dir = last > prev + 0.001 ? T.green : last < prev - 0.001 ? T.red : T.white;
  const buyP = ramp(f, at(6), at(7) + 10) * (1 - ramp(f, at(8), at(8) + 10));
  const sellP = ramp(f, at(8), at(9) + 10);
  return (
    <AbsoluteFill>
      {/* engine */}
      <div style={{ position: "absolute", left: interpolate(shift, [0, 1], [960, 330]) - 170, top: 250, width: 340, textAlign: "center", transform: `scale(${1 - shift * 0.25})` }}>
        <Gear size={340} rot={f * 3} />
        <Label size={36} weight={900} style={{ marginTop: 14, letterSpacing: 2 }}>MATCHING ENGINE</Label>
        <Label size={28} weight={600} color={T.goldHi} style={{ opacity: ramp(f, at(1), at(1) + 10) }}>in microseconds</Label>
      </div>
      {/* order streams */}
      {shift < 1 && new Array(10).fill(0).map((_, i) => {
        const c = ((f * 1.6 + i * 23) % 120) / 120;
        const side = i % 2 === 0;
        return <div key={i} style={{ position: "absolute", left: side ? interpolate(c, [0, 1], [120, 800]) : interpolate(c, [0, 1], [1800, 1120]), top: 410 + (random(`q${i}`) - 0.5) * 220, width: 22, height: 22, borderRadius: 22, background: side ? T.green : T.red, opacity: (1 - shift) * Math.sin(c * Math.PI), boxShadow: `0 0 14px ${side ? T.green : T.red}` }} />;
      })}
      {/* priority rules */}
      <div style={{ position: "absolute", left: 120, top: 760, display: "flex", gap: 20, opacity: 1 - shift }}>
        {[["1", "Best price first", at(2)], ["2", "Then first come, first served", at(3)]].map(([n, txt, s]) => (
          <Glass key={n as string} style={{ opacity: ramp(f, s as number, (s as number) + 10), padding: "12px 22px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 46, background: T.gold, color: "#1b1400", fontFamily: T.font, fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
            <Label size={32}>{txt}</Label>
          </Glass>
        ))}
      </div>
      {/* chart */}
      <div style={{ position: "absolute", left: 700, top: 150, width: 1080, opacity: chartIn, transform: `perspective(1600px) rotateY(${(1 - chartIn) * -30 - 6}deg)` }}>
        <Glass style={{ padding: "22px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label size={28} color={T.muted} weight={700} style={{ letterSpacing: 2 }}>LAST TRADE = PRICE</Label>
            <Label size={64} weight={900} color={dir} style={{ fontFamily: T.mono }}>${last.toFixed(2)}</Label>
          </div>
          <svg width="1000" height="300" viewBox="0 -20 920 300" style={{ marginTop: 8 }}>
            {[100.0, 101.0, 99.0].map((g) => <g key={g}><line x1="0" x2="900" y1={(102 - g) * 120} y2={(102 - g) * 120} stroke="rgba(255,255,255,0.08)" /><text x="905" y={(102 - g) * 120 + 8} fill={T.muted} fontSize="20" fontFamily="JetBrains Mono">{g}</text></g>)}
            <polyline points={pts.join(" ")} fill="none" stroke={T.goldHi} strokeWidth="5" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${T.gold})` }} />
          </svg>
        </Glass>
      </div>
      {/* pressure bars */}
      <div style={{ position: "absolute", left: 760, top: 720, width: 960, display: "flex", gap: 24, opacity: ramp(f, at(6) - 6, at(6) + 6) }}>
        <div style={{ flex: 1 }}><Label size={26} color={T.green}>Buyers {buyP > 0.5 ? "▲ paying the ask" : ""}</Label><div style={{ height: 22, marginTop: 8, borderRadius: 11, background: "rgba(255,255,255,0.06)" }}><div style={{ height: "100%", width: `${30 + buyP * 65 - sellP * 15}%`, background: T.green, borderRadius: 11 }} /></div></div>
        <div style={{ flex: 1 }}><Label size={26} color={T.red}>Sellers {sellP > 0.5 ? "▼ hitting the bid" : ""}</Label><div style={{ height: 22, marginTop: 8, borderRadius: 11, background: "rgba(255,255,255,0.06)" }}><div style={{ height: "100%", width: `${30 + sellP * 65 - buyP * 15}%`, background: T.red, borderRadius: 11 }} /></div></div>
      </div>
      {f > at(10) && <div style={{ position: "absolute", left: 120, top: 760, opacity: ramp(f, at(10), at(10) + 10), transform: `scale(${ramp(f, at(10), at(10) + 12, 0.8, 1)})` }}><Glass><Label size={40} weight={900} color={T.goldHi}>SUPPLY &amp; DEMAND</Label><Label size={26} color={T.muted}>tick by tick</Label></Glass></div>}
    </AbsoluteFill>
  );
};

/* 6 — CLEARING & T+1 SETTLEMENT */
export const Settle: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const ch = useIn(at(0) + 10, 12);
  const g = ramp(f, at(1), at(1) + 12);
  const lock = ramp(f, at(2), at(2) + 10);
  const tl = ramp(f, at(3), at(3) + 30);
  const swap = ramp(f, at(4), at(4) + 36);
  const acct = useIn(at(5));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 200, top: 300, textAlign: "center", width: 220 }}><Person color={T.goldHi} size={130} /><Label size={34}>BUYER (you)</Label></div>
      <div style={{ position: "absolute", left: 1500, top: 300, textAlign: "center", width: 220 }}><Person size={130} /><Label size={34}>SELLER</Label></div>
      <Stage rx={-12} ry={interpolate(f, [0, 450], [-20, 20])}>
        <div style={{ position: "absolute", left: 960 - 110, top: 520, transformStyle: "preserve-3d", transform: `translateY(${(1 - ch) * -500}px)`, opacity: ch }}>
          <div style={{ position: "absolute", transformStyle: "preserve-3d", transform: "translate3d(0,-240px,0)" }}>
            <Box3D w={220} h={240} d={220} color="#1d1a10" side={T.gold} top={T.goldHi} glow={g * 40}>
              <svg width="120" height="135" viewBox="0 0 24 27"><path d="M12 1 L22 5 V12 C22 19 17 24 12 26 C7 24 2 19 2 12 V5 Z" fill={T.gold} opacity={0.4 + g * 0.6} /><path d="M7.5 13 L11 16.5 L17 9.5" stroke="#1b1400" strokeWidth="2.4" fill="none" opacity={g} /></svg>
            </Box3D>
          </div>
        </div>
      </Stage>
      <div style={{ position: "absolute", left: 960 - 200, top: 560, width: 400, textAlign: "center", opacity: ch }}>
        <Label size={36} weight={900}>CLEARING HOUSE</Label>
        <Label size={28} weight={700} color={T.goldHi} style={{ opacity: g }}>guarantees the trade</Label>
      </div>
      <FlowArrow x1={420} y1={400} x2={820} y2={400} p={g} />
      <FlowArrow x1={1500} y1={400} x2={1100} y2={400} p={g} />
      {[620, 1300].map((x) => <div key={x} style={{ position: "absolute", left: x - 26, top: 340, fontSize: 52, opacity: lock, transform: `scale(${0.5 + lock * 0.5})` }}>🔒</div>)}
      {lock > 0 && f < at(3) && <div style={{ position: "absolute", width: "100%", top: 210, textAlign: "center", opacity: lock }}><Label size={36} color={T.muted}>neither side can back out</Label></div>}
      {/* T → T+1 timeline */}
      <div style={{ position: "absolute", left: 460, top: 740, width: 1000, opacity: ramp(f, at(3) - 4, at(3) + 8) }}>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)" }}><div style={{ height: 8, width: `${tl * 100}%`, borderRadius: 4, background: T.gold, boxShadow: `0 0 16px ${T.gold}` }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <Label size={32}>T <span style={{ color: T.muted, fontSize: 24 }}>trade day</span></Label>
          <Label size={40} weight={900} color={tl > 0.95 ? T.goldHi : T.muted}>T+1 <span style={{ fontSize: 24, color: T.muted }}>next business day</span></Label>
        </div>
      </div>
      {/* swap */}
      {swap > 0 && swap < 1 && (
        <>
          <div style={{ position: "absolute", left: interpolate(swap, [0, 1], [400, 1500]), top: 440 - Math.sin(swap * Math.PI) * 150 }}><Coin size={70} /></div>
          <div style={{ position: "absolute", left: interpolate(swap, [0, 1], [1500, 400]), top: 470 + Math.sin(swap * Math.PI) * 120, width: 60, height: 60, borderRadius: 8, background: T.goldHi, boxShadow: `0 0 24px ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font, fontWeight: 900, fontSize: 20, color: "#1b1400" }}>ACME</div>
        </>
      )}
      {f > at(4) && <div style={{ position: "absolute", width: "100%", top: 200, textAlign: "center", opacity: ramp(f, at(4), at(4) + 10) }}><Label size={40}>cash ⇄ shares</Label></div>}
      <div style={{ position: "absolute", left: 120, top: 120, opacity: acct, transform: `scale(${acct})`, transformOrigin: "left top" }}>
        <Glass style={{ borderColor: T.green }}>
          <Label size={24} color={T.muted}>YOUR ACCOUNT</Label>
          <Label size={44} weight={900}>ACME × 100 <span style={{ color: T.green }}>✓</span></Label>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

/* 7 — LONG-TERM vs SHORT-TERM, INDEXES */
export const Index: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const draw = ramp(f, at(0), at(1));
  const earnIn = ramp(f, at(1), at(2) + 10);
  const move = ramp(f, at(3) - 4, at(3) + 18);
  const N = 90;
  const earn = (i: number) => 230 - Math.pow(i / N, 1.4) * 170;
  const px = (i: number) => earn(i) + Math.sin(i * 0.55) * 22 + (random(`p${i}`) - 0.5) * 34 + Math.sin(i * 0.13) * 26;
  const line = (fn: (i: number) => number, p: number) => new Array(Math.max(2, Math.floor(N * p))).fill(0).map((_, i) => `${(i / N) * 820},${fn(i)}`).join(" ");
  const sectors = ["Tech", "Banks", "Energy", "Health", "Retail", "Autos", "Telecom", "Pharma", "Steel", "FMCG", "Media", "Utilities"];
  const basket = ramp(f, at(4), at(4) + 34);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: interpolate(move, [0, 1], [460, 90]), top: interpolate(move, [0, 1], [150, 140]), transform: `scale(${1 - move * 0.42})`, transformOrigin: "left top" }}>
        <Glass style={{ width: 920 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Label size={30} weight={800}>Price vs earnings · <span style={{ color: T.muted, fontWeight: 500 }}>over years</span></Label>
            <Label size={22} color={T.muted} weight={500}>illustrative</Label>
          </div>
          <svg width="860" height="280" viewBox="0 0 840 260" style={{ marginTop: 10 }}>
            <polyline points={line(px, draw)} fill="none" stroke={T.white} strokeWidth="3.5" opacity="0.9" />
            <polyline points={line(earn, earnIn)} fill="none" stroke={T.goldHi} strokeWidth="7" style={{ filter: `drop-shadow(0 0 10px ${T.gold})` }} />
          </svg>
          <div style={{ display: "flex", gap: 30 }}>
            <Label size={26} weight={600}><span style={{ color: T.white }}>━</span> price: news &amp; emotion</Label>
            <Label size={26} weight={600} style={{ opacity: earnIn }}><span style={{ color: T.goldHi }}>━</span> what companies earn</Label>
          </div>
        </Glass>
      </div>
      {/* sectors → index basket */}
      <Stage rx={-18} ry={interpolate(f, [0, 560], [18, -10])}>
        {sectors.map((s, i) => {
          const k = ramp(f, at(3) + i * 2, at(3) + 14 + i * 2);
          const sx = 1000 + (i % 4) * 200, sy = 300 + Math.floor(i / 4) * 120;
          const tx = 1260 + (i % 4) * 70, ty = 640 - Math.floor(i / 4) * 30;
          return (
            <div key={s} style={{ position: "absolute", left: interpolate(basket, [0, 1], [sx, tx]), top: interpolate(basket, [0, 1], [sy, ty]), opacity: k, transform: `scale(${interpolate(basket, [0, 1], [1, 0.45])})`, transformStyle: "preserve-3d" }}>
              <Box3D w={170} h={80} d={30} color="#1b1d26" side={T.gold}><Label size={26} weight={700}>{s}</Label></Box3D>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 1180, top: 640, transformStyle: "preserve-3d", opacity: ramp(f, at(4), at(4) + 12) }}>
          <Box3D w={380} h={150} d={200} color={`${T.gold}cc`} side={T.gold} top="rgba(212,175,55,0.25)" glow={basket * 30}>
            <Label size={52} weight={900} color="#1b1400">INDEX</Label>
          </Box3D>
        </div>
      </Stage>
      <div style={{ position: "absolute", left: 1040, top: 140, display: "flex", flexDirection: "column", gap: 16 }}>
        {[["S&P 500", "~500 large US companies"], ["Nifty 50", "50 large Indian companies"]].map(([a, b], i) => (
          <Glass key={a} style={{ opacity: ramp(f, at(5) + i * 16, at(5) + i * 16 + 10), padding: "12px 24px", transform: `translateX(${(1 - ramp(f, at(5) + i * 16, at(5) + i * 16 + 10)) * 40}px)` }}>
            <Label size={40} weight={900} color={T.goldHi}>{a}</Label>
            <Label size={24} weight={500} color={T.muted}>{b}</Label>
          </Glass>
        ))}
      </div>
      {f > at(3) && f < at(5) && <div style={{ position: "absolute", left: 160, top: 560, opacity: ramp(f, at(3), at(3) + 10) }}><Label size={60} weight={900}>“The market is <span style={{ color: T.green }}>up ▲</span>”</Label></div>}
      {f > at(6) && <div style={{ position: "absolute", left: 150, top: 600, opacity: ramp(f, at(6), at(6) + 10) }}><Label size={40} weight={700}>one number for a <span style={{ color: T.goldHi }}>basket of companies</span></Label></div>}
    </AbsoluteFill>
  );
};

/* 8 — RECAP + CTA */
export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const at = useP();
  const steps = [["Company", "issues shares (IPO)"], ["Broker", "routes your order"], ["Order book", "matches buyer & seller"], ["Clearing house", "guarantees the trade"], ["Settlement", "delivers it · T+1"]];
  const title = useIn(at(6));
  const sub = useIn(at(7));
  const up = ramp(f, at(6) - 4, at(6) + 16);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(up, [0, 1], [330, 110]), display: "flex", justifyContent: "center", gap: 26, perspective: 1800, transform: `scale(${1 - up * 0.2})` }}>
        {steps.map(([a, b], i) => {
          const k = ramp(f, at(i + 1), at(i + 1) + 12);
          const lit = f >= at(i + 1);
          return (
            <div key={a} style={{ width: 300, height: 260, borderRadius: 26, background: lit ? `linear-gradient(160deg, #2a2412, ${T.panel})` : "rgba(255,255,255,0.03)", border: `3px solid ${lit ? T.gold : "rgba(255,255,255,0.08)"}`, transform: `rotateY(${(i - 2) * -9}deg) translateZ(${k * 40}px)`, boxShadow: lit ? `0 0 40px ${T.gold}44` : undefined, padding: 26, boxSizing: "border-box", opacity: 0.35 + 0.65 * k }}>
              <div style={{ width: 64, height: 64, borderRadius: 64, background: lit ? T.gold : "rgba(255,255,255,0.1)", color: "#1b1400", fontFamily: T.font, fontWeight: 900, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
              <Label size={38} weight={900} style={{ marginTop: 22 }}>{a}</Label>
              <Label size={26} weight={500} color={T.muted} style={{ marginTop: 8 }}>{b}</Label>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", width: "100%", top: 520, textAlign: "center", opacity: title, transform: `scale(${0.85 + 0.15 * title})` }}>
        <Label size={84} weight={900} style={{ fontFamily: T.display }}>That's how the stock market <span style={{ color: T.goldHi }}>works</span>.</Label>
      </div>
      <div style={{ position: "absolute", width: "100%", top: 690, display: "flex", justifyContent: "center", opacity: sub, transform: `scale(${sub})` }}>
        <div style={{ position: "relative", padding: "20px 48px", borderRadius: 18, background: f > at(7) + 30 ? "#2a2a2a" : T.gold, color: f > at(7) + 30 ? T.white : "#1b1400", fontFamily: T.font, fontWeight: 900, fontSize: 44, boxShadow: `0 0 40px ${T.gold}66` }}>
          {f > at(7) + 30 ? "SUBSCRIBED ✓  🔔" : "SUBSCRIBE"}
          {f > at(7) + 14 && f < at(7) + 40 && <div style={{ position: "absolute", right: 30, bottom: -30 + Math.max(0, at(7) + 30 - f) * 3, width: 50, height: 50, borderRadius: 50, background: "rgba(255,255,255,0.4)", border: "3px solid white" }} />}
        </div>
      </div>
      {f > at(8) && <div style={{ position: "absolute", width: "100%", top: 812, textAlign: "center", opacity: ramp(f, at(8), at(8) + 10) }}><Label size={26} weight={500} color={T.muted}>For education only · not financial advice</Label></div>}
    </AbsoluteFill>
  );
};

/* END SCREEN: holds space for YouTube end-screen elements (2 videos + subscribe). */
export const EndScreen: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 14);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <div style={{ position: "absolute", width: "100%", top: 120, textAlign: "center" }}><Label size={60} weight={900}>Keep learning</Label></div>
      {[180, 1000].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 300, width: 740, height: 416, borderRadius: 20, border: `3px dashed ${T.goldDim}` }} />)}
      <div style={{ position: "absolute", left: 960 - 90, top: 790, width: 180, height: 180, borderRadius: 180, border: `3px dashed ${T.goldDim}` }} />
    </AbsoluteFill>
  );
};
