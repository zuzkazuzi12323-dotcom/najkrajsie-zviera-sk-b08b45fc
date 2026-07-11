import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";
import { colors, fontFamily } from "./theme";

const FPS = 30;

// Ken Burns image
const KenBurns = ({ src, dir = 1 }: { src: string; dir?: number }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 150], [1.08, 1.22]);
  const x = interpolate(frame, [0, 150], [0, 20 * dir]);
  const y = interpolate(frame, [0, 150], [0, -18]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.bg }}>
      <Img src={staticFile(src)} style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${scale}) translate(${x}px, ${y}px)`,
      }} />
      <AbsoluteFill style={{
        background: "linear-gradient(180deg, rgba(26,18,8,0.35) 0%, transparent 30%, transparent 45%, rgba(26,18,8,0.75) 88%, rgba(26,18,8,0.95) 100%)",
      }} />
    </AbsoluteFill>
  );
};

const Caption = ({ text, accent }: { text: string; accent?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 200 } });
  const y = interpolate(inS, [0, 1], [50, 0]);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 70px 230px" }}>
      <div style={{ opacity: inS, transform: `translateY(${y}px)`, textAlign: "center" }}>
        <p style={{
          color: colors.cream, fontSize: 62, fontWeight: 800, lineHeight: 1.12,
          margin: 0, letterSpacing: -1, textShadow: "0 4px 24px rgba(0,0,0,0.7)",
        }}>
          {text}{accent ? <span style={{ color: colors.gold }}> {accent}</span> : null}
        </p>
      </div>
    </AbsoluteFill>
  );
};

const TopBrand = () => {
  const frame = useCurrentFrame();
  const inS = spring({ frame: frame - 4, fps: FPS, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", padding: "70px 0 0" }}>
      <div style={{
        opacity: inS,
        display: "flex", alignItems: "center", gap: 14,
        background: "rgba(26,18,8,0.55)", padding: "12px 26px", borderRadius: 999,
        border: `1.5px solid ${colors.gold}`,
      }}>
        <Img src={staticFile("images/logo-dog.png")} style={{ width: 40, height: 40, objectFit: "contain" }} />
        <span style={{ color: colors.cream, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
          Najkrajší<span style={{ color: colors.gold }}>miláčik</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const logoIn = spring({ frame, fps: FPS, config: { damping: 13, stiffness: 120 } });
  const titleIn = spring({ frame: frame - 10, fps: FPS, config: { damping: 200 } });
  const urlIn = spring({ frame: frame - 22, fps: FPS, config: { damping: 200 } });
  const ring = (frame % 60) / 60;
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 50% 42%, ${colors.brown} 0%, ${colors.bg} 72%)`,
      justifyContent: "center", alignItems: "center", flexDirection: "column",
    }}>
      <div style={{
        position: "absolute", top: "34%",
        width: 300 + ring * 400, height: 300 + ring * 400, borderRadius: "50%",
        border: `2px solid ${colors.gold}`, opacity: (1 - ring) * 0.3,
      }} />
      <div style={{
        width: 230, height: 230, borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${logoIn})`, boxShadow: "0 20px 60px rgba(224,164,72,0.5)", marginBottom: 44,
      }}>
        <Img src={staticFile("images/logo-dog.png")} style={{ width: 165, height: 165, objectFit: "contain" }} />
      </div>
      <h1 style={{
        opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
        color: colors.cream, fontSize: 92, fontWeight: 800, margin: 0, textAlign: "center", letterSpacing: -2,
      }}>
        Najkrajší<br /><span style={{ color: colors.gold }}>miláčik</span>
      </h1>
      <div style={{
        opacity: urlIn, transform: `translateY(${interpolate(urlIn, [0, 1], [24, 0])}px)`,
        marginTop: 52, background: colors.gold, color: colors.bg,
        padding: "22px 44px", borderRadius: 999, fontSize: 40, fontWeight: 800, letterSpacing: -0.5,
        boxShadow: "0 16px 40px rgba(224,164,72,0.4)",
      }}>
        donio.sk/najkrajsipes
      </div>
      <p style={{ opacity: urlIn, color: colors.goldLight, fontSize: 30, fontWeight: 700, marginTop: 40, letterSpacing: 2 }}>
        Podporte nás ❤️
      </p>
    </AbsoluteFill>
  );
};

// timings (frames @30fps) — narration ~28.5s
const S = {
  s1: [0, 138],
  s2: [138, 138],
  s3: [276, 168],
  s4: [444, 168],
  s5: [612, 150],
  outro: [762, 138],
};
export const TIKTOK_FRAMES = 900;

export const TikTokVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily }}>
      <Sequence from={S.s1[0]} durationInFrames={S.s1[1]}>
        <KenBurns src="tiktok/v1.jpg" dir={1} />
        <TopBrand />
        <Caption text="Každý psík je výnimočný a zaslúži si" accent="lásku" />
      </Sequence>
      <Sequence from={S.s2[0]} durationInFrames={S.s2[1]}>
        <KenBurns src="tiktok/v6.jpg" dir={-1} />
        <TopBrand />
        <Caption text="Pripravujeme projekt" accent="Najkrajší miláčik" />
      </Sequence>
      <Sequence from={S.s3[0]} durationInFrames={S.s3[1]}>
        <KenBurns src="tiktok/v3.jpg" dir={1} />
        <TopBrand />
        <Caption text="Súťaž pre všetkých milovníkov zvierat" />
      </Sequence>
      <Sequence from={S.s4[0]} durationInFrames={S.s4[1]}>
        <KenBurns src="tiktok/v4.jpg" dir={-1} />
        <TopBrand />
        <Caption text="Spájame ľudí a pomáhame" accent="útulkom" />
      </Sequence>
      <Sequence from={S.s5[0]} durationInFrames={S.s5[1]}>
        <KenBurns src="tiktok/v5.jpg" dir={1} />
        <TopBrand />
        <Caption text="Podporte nás cez Donio alebo" accent="zdieľaním" />
      </Sequence>
      <Sequence from={S.outro[0]} durationInFrames={S.outro[1]}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
