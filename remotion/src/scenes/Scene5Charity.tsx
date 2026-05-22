import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { colors } from "../theme";

export const Scene5Charity = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leftIn = spring({ frame, fps, config: { damping: 200 } });
  const rightIn = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const beatPulse = 1 + Math.sin(frame / 8) * 0.04;

  const items = [
    { p: "20 %", t: "Z každej registrácie psa (2,99 €)" },
    { p: "20 %", t: "Z každého nákupu v e-shope" },
    { p: "100 %", t: "Z priamych darov pre útulky" },
  ];

  return (
    <AbsoluteFill style={{
      background: colors.cream,
      display: "flex",
      flexDirection: "row",
    }}>
      <div style={{
        flex: 1.1,
        padding: "100px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity: leftIn,
        transform: `translateX(${interpolate(leftIn, [0, 1], [-40, 0])}px)`,
      }}>
        <div style={{
          fontSize: 110,
          transform: `scale(${beatPulse})`,
          transformOrigin: "left center",
          marginBottom: 10,
        }}>❤️</div>
        <p style={{
          color: colors.accent, fontSize: 22, fontWeight: 700,
          letterSpacing: 6, textTransform: "uppercase", margin: 0,
        }}>
          Skutočná misia
        </p>
        <h2 style={{
          color: colors.bg, fontSize: 96, fontWeight: 800,
          margin: "16px 0 30px", letterSpacing: -3, lineHeight: 0.95,
        }}>
          Krása psov<br />
          <span style={{ color: colors.gold }}>pomáha útulkom</span>
        </h2>
        <p style={{
          color: colors.brown, fontSize: 26, fontWeight: 500,
          margin: 0, maxWidth: 600, lineHeight: 1.4,
        }}>
          Z každej registrácie a nákupu posielame časť do útulkov pre opustené zvieratá. Transparentne. Pravidelne.
        </p>
      </div>
      <div style={{
        flex: 1,
        background: `linear-gradient(160deg, ${colors.gold} 0%, ${colors.goldDeep} 100%)`,
        padding: "100px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 30,
        opacity: rightIn,
      }}>
        {items.map((it, i) => {
          const itemIn = spring({ frame: frame - 25 - i * 10, fps, config: { damping: 14, stiffness: 120 } });
          const x = interpolate(itemIn, [0, 1], [60, 0]);
          return (
            <div key={i} style={{
              background: colors.cream,
              borderRadius: 28,
              padding: "30px 36px",
              display: "flex",
              alignItems: "center",
              gap: 32,
              opacity: itemIn,
              transform: `translateX(${x}px)`,
              boxShadow: `8px 8px 0 rgba(0,0,0,0.15)`,
            }}>
              <div style={{
                fontSize: 76,
                fontWeight: 800,
                color: colors.accent,
                letterSpacing: -2,
                minWidth: 170,
              }}>
                {it.p}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 600,
                color: colors.brown,
                lineHeight: 1.3,
              }}>
                {it.t}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
