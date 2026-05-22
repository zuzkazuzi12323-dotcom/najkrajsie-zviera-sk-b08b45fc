import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../theme";

export const Scene6Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const titleIn = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const urlIn = spring({ frame: frame - 25, fps, config: { damping: 200 } });
  const tagsIn = spring({ frame: frame - 40, fps, config: { damping: 200 } });

  const lineW = interpolate(spring({ frame: frame - 20, fps, config: { damping: 200 } }), [0, 1], [0, 600]);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, ${colors.brown} 0%, ${colors.bg} 80%)`,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      padding: 80,
    }}>
      <div style={{
        width: 160, height: 160, borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${logoIn})`,
        boxShadow: `0 20px 60px rgba(224, 164, 72, 0.5)`,
        marginBottom: 36,
      }}>
        <Img src={staticFile("images/logo-dog.png")} style={{ width: 120, height: 120, objectFit: "contain" }} />
      </div>

      <h1 style={{
        opacity: titleIn,
        transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
        color: colors.cream,
        fontSize: 100,
        fontWeight: 800,
        margin: 0,
        letterSpacing: -3,
        textAlign: "center",
      }}>
        Pripravená platforma.<br />
        <span style={{ color: colors.gold }}>Pripravený biznis.</span>
      </h1>

      <div style={{ width: lineW, height: 3, background: colors.gold, margin: "30px 0" }} />

      <div style={{
        opacity: urlIn,
        transform: `translateY(${interpolate(urlIn, [0, 1], [20, 0])}px)`,
        background: colors.gold,
        color: colors.bg,
        padding: "22px 56px",
        borderRadius: 999,
        fontSize: 52,
        fontWeight: 800,
        letterSpacing: -1,
        boxShadow: `0 16px 40px rgba(224, 164, 72, 0.4)`,
      }}>
        najkrajsiPes.sk
      </div>

      <div style={{
        opacity: tagsIn,
        marginTop: 50,
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {["Súťaž", "E-shop", "Charita", "Admin panel", "Stripe platby", "Realtime"].map((t) => (
          <span key={t} style={{
            border: `2px solid ${colors.goldLight}`,
            color: colors.goldLight,
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 600,
          }}>{t}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
