import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080b0b",
      }}
    >
      <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
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
    </div>,
    size,
  );
}
