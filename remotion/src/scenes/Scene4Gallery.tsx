import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../theme";

const dogs = ["dog1.jpg", "dog2.jpg", "dog3.jpg", "dog4.jpg", "dog5.jpg", "dog6.jpg"];

export const Scene4Gallery = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{
      background: colors.bg,
      padding: "70px 100px",
    }}>
      <div style={{ opacity: headIn, marginBottom: 50 }}>
        <p style={{
          color: colors.gold, fontSize: 20, fontWeight: 700,
          letterSpacing: 6, textTransform: "uppercase", margin: 0,
        }}>
          Galéria · Hlasovanie · Komentáre
        </p>
        <h2 style={{
          color: colors.cream, fontSize: 90, fontWeight: 800,
          margin: "12px 0 0", letterSpacing: -2, lineHeight: 1,
        }}>
          Krásne profily, <span style={{ color: colors.goldLight }}>skutoční psíci</span>
        </h2>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: 24,
        flex: 1,
        minHeight: 560,
      }}>
        {dogs.map((d, i) => {
          const inSpring = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 16, stiffness: 110 } });
          const scale = interpolate(inSpring, [0, 1], [0.6, 1]);
          const opacity = inSpring;
          const float = Math.sin((frame + i * 20) / 30) * 4;
          const isFeatured = i === 0 || i === 4;
          return (
            <div key={d} style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              transform: `scale(${scale}) translateY(${float}px)`,
              opacity,
              boxShadow: isFeatured ? `0 0 0 4px ${colors.gold}, 0 20px 50px rgba(0,0,0,0.5)` : `0 12px 30px rgba(0,0,0,0.4)`,
            }}>
              <Img src={staticFile(`images/${d}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)",
              }} />
              <div style={{
                position: "absolute", bottom: 18, left: 20, right: 20,
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
              }}>
                <div style={{ color: colors.cream, fontWeight: 800, fontSize: 26 }}>
                  Pes #{i + 1}
                </div>
                <div style={{
                  background: colors.gold, color: colors.bg,
                  padding: "6px 14px", borderRadius: 999,
                  fontSize: 16, fontWeight: 700,
                }}>
                  ❤ {120 + i * 47}
                </div>
              </div>
              {isFeatured && (
                <div style={{
                  position: "absolute", top: 14, left: 14,
                  background: colors.gold, color: colors.bg,
                  padding: "4px 10px", borderRadius: 999,
                  fontSize: 13, fontWeight: 800, letterSpacing: 1,
                }}>★ TOP</div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
