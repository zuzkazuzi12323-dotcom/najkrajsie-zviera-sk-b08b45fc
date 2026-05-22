import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../theme";

const stats = [
  { value: 2500, suffix: "+", label: "Hlasov za psov", color: colors.gold },
  { value: 320, suffix: "+", label: "Registrovaných psíkov", color: colors.accent },
  { value: 20, suffix: "%", label: "Z platieb do útulkov", color: colors.goldLight },
];

const StatCard = ({ s, delay }: { s: typeof stats[0]; delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  const y = interpolate(inSpring, [0, 1], [80, 0]);
  const opacity = inSpring;
  const counter = interpolate(frame - delay, [0, 40], [0, s.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      flex: 1,
      background: colors.cream,
      border: `3px solid ${colors.brown}`,
      borderRadius: 32,
      padding: "60px 40px",
      opacity,
      transform: `translateY(${y}px)`,
      boxShadow: `12px 12px 0 ${colors.brown}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 140,
        fontWeight: 800,
        color: s.color,
        lineHeight: 1,
        letterSpacing: -4,
        fontVariantNumeric: "tabular-nums",
      }}>
        {Math.round(counter).toLocaleString()}{s.suffix}
      </div>
      <div style={{
        fontSize: 24,
        fontWeight: 600,
        color: colors.brown,
        marginTop: 24,
        maxWidth: 260,
      }}>
        {s.label}
      </div>
    </div>
  );
};

export const Scene3Stats = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${colors.goldLight} 0%, ${colors.gold} 100%)`,
      padding: "100px 100px",
      justifyContent: "center",
    }}>
      <div style={{ opacity: headIn, textAlign: "center", marginBottom: 80 }}>
        <p style={{
          color: colors.brown,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          margin: 0,
        }}>
          Komunita ktorá rastie
        </p>
        <h2 style={{
          color: colors.bg,
          fontSize: 90,
          fontWeight: 800,
          margin: "16px 0 0",
          letterSpacing: -2,
        }}>
          Čísla, ktoré hovoria za nás
        </h2>
      </div>
      <div style={{ display: "flex", gap: 40 }}>
        {stats.map((s, i) => <StatCard key={i} s={s} delay={20 + i * 12} />)}
      </div>
    </AbsoluteFill>
  );
};
