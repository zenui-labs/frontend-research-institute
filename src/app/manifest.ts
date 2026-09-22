import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Frontend Research Institute",
    short_name: "FRI",
    description:
      "Interactive experiments on browser rendering, CSS layout, the JavaScript event loop, React reconciliation and web performance.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b0b",
    theme_color: "#080b0b",
    categories: ["education", "developer", "reference"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
