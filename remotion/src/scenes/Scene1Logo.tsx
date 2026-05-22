import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../theme";

export const Scene1Logo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoIn = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const logoScale = interpolate(logoIn, [0, 1], [0.4, 1]);
  const logoRot = interpolate(logoIn, [0, 1], [-25, 0]);

  const titleIn = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  const titleY = interpolate(titleIn, [0, 1], [40, 0]);

  const subIn = spring({ frame: frame - 32, fps, config: { damping: 200 } });

  // gold pulse rings
  const ring1 = (frame % 60) / 60;
  const ring2 = ((frame + 30) % 60) / 60;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 50% 45%, ${colors.brown} 0%, ${colors.bg} 70%)`,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    }}>
      {[ring1, ring2].map((r, i) => (
        <div key={i} style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          width: 280 + r * 600,
          height: 280 + r * 600,
          marginLeft: -(280 + r * 600) / 2,
          marginTop: -(280 + r * 600) / 2,
          borderRadius: "50%",
          border: `2px solid ${colors.gold}`,
          opacity: (1 - r) * 0.3,
        }} />
      ))}
      <div style={{
        width: 240, height: 240, borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
        boxShadow: `0 20px 60px rgba(224, 164, 72, 0.4)`,
        marginBottom: 50,
      }}>
        <Img src={staticFile("images/logo-dog.png")} style={{ width: 180, height: 180, objectFit: "contain" }} />
      </div>
      <div style={{
        opacity: titleIn,
        transform: `translateY(${titleY}px)`,
        textAlign: "center",
      }}>
        <h1 style={{
          color: colors.cream,
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: -2,
          margin: 0,
          lineHeight: 1,
        }}>
          najkrajsí<span style={{ color: colors.gold }}>Pes</span>
          <span style={{ color: colors.goldLight, fontWeight: 400 }}>.sk</span>
        </h1>
        <p style={{
          color: colors.goldLight,
          fontSize: 28,
          marginTop: 20,
          fontWeight: 600,
          letterSpacing: 8,
          textTransform: "uppercase",
          opacity: subIn,
        }}>
          Súťaž krásy · Charita · E-shop
        </p>
      </div>
    </AbsoluteFill>
  );
};
