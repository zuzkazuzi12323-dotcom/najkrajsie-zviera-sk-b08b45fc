import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../theme";

export const Scene2Hero = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 110], [1.05, 1.18]);
  const pan = interpolate(frame, [0, 110], [0, -40]);

  const textIn = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const textY = interpolate(textIn, [0, 1], [50, 0]);

  const lineIn = spring({ frame: frame - 25, fps, config: { damping: 200 } });

  const subIn = spring({ frame: frame - 45, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: "hidden" }}>
      <Img
        src={staticFile("images/hero-dog.jpg")}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${zoom}) translateX(${pan}px)`,
        }}
      />
      <AbsoluteFill style={{
        background: `linear-gradient(90deg, rgba(26,18,8,0.85) 0%, rgba(26,18,8,0.5) 50%, transparent 100%)`,
      }} />
      <AbsoluteFill style={{ padding: "0 120px", justifyContent: "center" }}>
        <div style={{ maxWidth: 900, opacity: textIn, transform: `translateY(${textY}px)` }}>
          <div style={{
            display: "inline-block",
            padding: "10px 22px",
            background: colors.gold,
            color: colors.bg,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            borderRadius: 999,
            marginBottom: 28,
          }}>
            Najväčšia súťaž krásy psov na Slovensku
          </div>
          <h2 style={{
            color: colors.cream,
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: -3,
            margin: 0,
          }}>
            Pridajte<br />
            <span style={{ color: colors.goldLight }}>svojho miláčika</span><br />
            do súťaže
          </h2>
          <div style={{
            width: lineIn * 300,
            height: 4,
            background: colors.gold,
            marginTop: 30,
            marginBottom: 30,
          }} />
          <p style={{
            color: colors.cream,
            fontSize: 32,
            fontWeight: 600,
            margin: 0,
            opacity: subIn,
            maxWidth: 700,
          }}>
            Mesačné vyhodnotenie · Diplomy · Darčeky pre víťazov
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
