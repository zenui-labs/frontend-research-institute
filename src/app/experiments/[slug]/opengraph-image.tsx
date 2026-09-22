import { ImageResponse } from "next/og";
import { EXPERIMENTS, EXPERIMENT_BY_SLUG, getLab } from "@/content";

export const alt = "Frontend Research Institute experiment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return EXPERIMENTS.map((experiment) => ({ slug: experiment.slug }));
}

export default async function ExperimentOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiment = EXPERIMENT_BY_SLUG.get(slug);
  const lab = experiment ? getLab(experiment.lab) : undefined;

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
          "radial-gradient(760px 460px at 10% 0%, rgba(94,230,160,0.18), transparent 70%)",
        padding: "64px 72px",
        color: "#f2f7f4",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 19, color: "#93a29b" }}
      >
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="8.5" stroke="#5ee6a0" strokeOpacity="0.5" strokeWidth="1.8" />
          <path
            d="M16 7.5a8.5 8.5 0 0 1 8.5 8.5"
            stroke="#5ee6a0"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="20.4" cy="11.6" r="2.4" fill="#5ee6a0" />
        </svg>
        <span>Frontend Research Institute</span>
        {lab ? <span>· {lab.name}</span> : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>
        <span style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2 }}>
          {experiment?.title ?? "Experiment"}
        </span>
        <span style={{ fontSize: 26, lineHeight: 1.4, color: "#93a29b" }}>
          {experiment?.summary ?? ""}
        </span>
      </div>

      <div style={{ display: "flex", gap: 14, fontSize: 18 }}>
        {[
          experiment?.difficulty ?? "",
          experiment ? `${experiment.estimatedMinutes} min` : "",
          experiment?.type ?? "",
        ]
          .filter(Boolean)
          .map((chip) => (
            <span
              key={chip}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(94,230,160,0.12)",
                color: "#5ee6a0",
              }}
            >
              {chip}
            </span>
          ))}
      </div>
    </div>,
    size,
  );
}
