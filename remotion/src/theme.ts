import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const colors = {
  bg: "#1a1208",
  cream: "#fdf8f0",
  gold: "#e0a448",
  goldLight: "#f0c878",
  goldDeep: "#a16f2c",
  brown: "#3a2614",
  text: "#1a1208",
  accent: "#e85d3a",
};
