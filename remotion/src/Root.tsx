import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES } from "./MainVideo";
import { TikTokVideo, TIKTOK_FRAMES } from "./TikTokVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="tiktok"
      component={TikTokVideo}
      durationInFrames={TIKTOK_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
