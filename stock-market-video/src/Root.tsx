import React from "react";
import { Composition, Still } from "remotion";
import { Thumbnail } from "./Thumbnail";
import { Video, END_FRAMES } from "./Video";
import tl from "./timeline.json";

export const Root: React.FC = () => (
  <>
  <Composition id="StockMarket" component={Video} durationInFrames={tl.total + END_FRAMES} fps={tl.fps} width={1920} height={1080} />
  <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
