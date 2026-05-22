import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Logo } from "./scenes/Scene1Logo";
import { Scene2Hero } from "./scenes/Scene2Hero";
import { Scene3Stats } from "./scenes/Scene3Stats";
import { Scene4Gallery } from "./scenes/Scene4Gallery";
import { Scene5Charity } from "./scenes/Scene5Charity";
import { Scene6Outro } from "./scenes/Scene6Outro";
import { colors, fontFamily } from "./theme";

const D = { s1: 90, s2: 110, s3: 120, s4: 130, s5: 110, s6: 110 };
const T = 18;
export const TOTAL_FRAMES = D.s1 + D.s2 + D.s3 + D.s4 + D.s5 + D.s6 - T * 5;

const Grain = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.04, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="n">
          <feTurbulence baseFrequency="0.9" seed={Math.floor(frame / 2)} />
        </filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
    pointerEvents: "none",
  }} />
);

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream, fontFamily }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D.s1}>
          <Scene1Logo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D.s2}>
          <Scene2Hero />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D.s3}>
          <Scene3Stats />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom-right" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D.s4}>
          <Scene4Gallery />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D.s5}>
          <Scene5Charity />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D.s6}>
          <Scene6Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
