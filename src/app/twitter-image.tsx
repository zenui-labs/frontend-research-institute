import { ImageResponse } from "next/og";
import { INSTITUTE_STATS } from "@/content";

export const alt =
  "Frontend Research Institute. Investigate the web. Break things. Understand why.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#080b0b",
        backgroundImage:
          "radial-gradient(700px 420px at 12% 0%, rgba(94,230,160,0.20), transparent 70%), radial-gradient(620px 420px at 95% 25%, rgba(240,125,82,0.12), transparent 70%)",
        padding: "68px 72px",
        color: "#f2f7f4",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="8.5" stroke="#5ee6a0" strokeOpacity="0.5" strokeWidth="1.8" />
          <path
            d="M16 7.5a8.5 8.5 0 0 1 8.5 8.5"
            stroke="#5ee6a0"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="20.4" cy="11.6" r="2.4" fill="#5ee6a0" />
          <path d="M11 20.5h10" stroke="#93a29b" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 26, fontWeight: 600 }}>Frontend Research Institute</span>
          <span
            style={{ fontSize: 17, letterSpacing: 4, color: "#66746e", textTransform: "uppercase" }}
          >
            Department of Browser Behaviour
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2.5 }}>
          Investigate the web.
        </span>
        <span
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -2.5,
            color: "#5ee6a0",
          }}
        >
          Understand why.
        </span>
      </div>

      <div style={{ display: "flex", gap: 56, fontSize: 20, color: "#93a29b" }}>
        <span>{INSTITUTE_STATS.experiments} interactive experiments</span>
        <span>{INSTITUTE_STATS.cases} case files</span>
        <span>{INSTITUTE_STATS.dossiers} research dossiers</span>
      </div>
    </div>,
    size,
  );
}
