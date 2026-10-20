import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import tl from "./timeline.json";
import { T } from "./design/tokens";
import { Backdrop, Captions, Chrome, PhraseCtx, ramp } from "./components";
import { Hook, Players, Stock } from "./scenes/A";
import { EndScreen, Index, Matching, OrderBook, Recap, Settle } from "./scenes/B";

export const END_FRAMES = 8 * 30;
const SCENES = [Hook, Stock, Players, OrderBook, Matching, Settle, Index, Recap];
type Scene = (typeof tl.scenes)[number];

const Shell: React.FC<{ s: Scene; i: number }> = ({ s, i }) => {
  const f = useCurrentFrame();
  const C = SCENES[i];
  const enter = ramp(f, 0, 14);
  const exit = ramp(f, s.frames - 10, s.frames);
  return (
    <PhraseCtx.Provider value={s.phrases}>
      <Backdrop floor={i !== 3} />
      <AbsoluteFill style={{ opacity: enter * (1 - exit), transform: `scale(${1.04 - 0.04 * enter + 0.03 * exit})`, filter: `blur(${(1 - enter) * 8 + exit * 8}px)` }}>
        <C />
      </AbsoluteFill>
      <Chrome chapter={s.chapter} index={i} count={tl.scenes.length} globalFrame={s.from + f} total={tl.total} />
      <Captions phrases={s.phrases} />
    </PhraseCtx.Provider>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg }}>
    {tl.scenes.map((s, i) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
        <Shell s={s} i={i} />
        <Sequence from={s.audioFrom}><Audio src={staticFile(s.audio)} /></Sequence>
      </Sequence>
    ))}
    <Sequence from={tl.total} durationInFrames={END_FRAMES} name="end">
      <Backdrop />
      <EndScreen />
    </Sequence>
  </AbsoluteFill>
);
