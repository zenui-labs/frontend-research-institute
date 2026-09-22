import Link from "next/link";
import { DOSSIERS, EXPERIMENTS, INSTITUTE_STATS } from "@/content";
import { REPO, SITE } from "@/lib/site";
import { GithubMark, InstituteMark, Wordmark } from "./logo";

const COLUMNS = [
  {
    title: "Laboratories",
    links: [
      { href: "/labs/browser", label: "Browser Lab" },
      { href: "/labs/css", label: "CSS Lab" },
      { href: "/labs/javascript", label: "JavaScript Lab" },
      { href: "/labs/react", label: "React Lab" },
      { href: "/labs/performance", label: "Performance Lab" },
      { href: "/labs", label: "All ten laboratories" },
    ],
  },
  {
    title: "Divisions",
    links: [
      { href: "/experiments", label: "Experiments" },
      { href: "/detective", label: "Frontend Detective" },
      { href: "/research", label: "Research dossiers" },
      { href: "/myths", label: "Myth archive" },
      { href: "/archives", label: "Web archaeology" },
      { href: "/observatory", label: "Observatory" },
    ],
  },
  {
    title: "Institute",
    links: [
      { href: "/about", label: "About the institute" },
      { href: "/about", label: "Standard of evidence" },
      { href: "/profile", label: "Your research ID" },
      { href: "/about", label: "Accessibility" },
    ],
  },
] as const;

const SOURCE_LINKS = [
  { href: REPO.root, label: "Source on GitHub" },
  { href: REPO.contributing, label: "Contributing guide" },
  { href: REPO.correction, label: "Report a correction" },
  { href: REPO.newExperiment, label: "Propose an experiment" },
  { href: REPO.issues, label: "Open issues" },
] as const;

export function Footer() {
  return (
    <footer className="border-line bg-ink-850 relative mt-28 border-t">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <InstituteMark />
              <Wordmark />
            </Link>
            <p className="text-steel mt-5 max-w-xs text-sm leading-relaxed">
              A fictional research facility with real engineering content. Every claim is either
              cited, reproducible in a bench on this site, or labelled as a simplification.
            </p>

            <dl className="border-line bg-line mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border sm:grid-cols-4 lg:grid-cols-2">
              {[
                ["Experiments", EXPERIMENTS.length],
                ["Case files", INSTITUTE_STATS.cases],
                ["Dossiers", DOSSIERS.length],
                ["Artifacts", INSTITUTE_STATS.artifacts],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-ink-800 px-4 py-3.5">
                  <dt className="label-tech">{label}</dt>
                  <dd className="font-display text-bone mt-1 text-lg font-semibold tabular-nums">
                    {String(value).padStart(2, "0")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-10 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="label-tech mb-4">{column.title}</p>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-steel hover:text-bone text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <nav aria-label="Source">
              <p className="label-tech mb-4">Open source</p>
              <ul className="space-y-2.5">
                {SOURCE_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-steel hover:text-bone text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-line mt-14 border-t pt-6 pb-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-2xs text-steel-dim">
              © {new Date().getFullYear()} Frontend Research Institute · Department of Browser
              Behaviour
            </p>
            <p className="text-2xs text-steel-dim flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={REPO.root}
                target="_blank"
                rel="noreferrer noopener"
                className="text-steel hover:text-bone inline-flex items-center gap-1.5 transition-colors"
              >
                <GithubMark className="h-3.5 w-3.5" />
                Open source under {SITE.license}
              </a>
              <span>
                Resource by{" "}
                <a
                  href="https://zenui.net"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-crt decoration-crt/30 hover:decoration-crt font-medium underline underline-offset-4 transition-colors"
                >
                  ZenUI
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>

      <div aria-hidden className="relative -mt-2 overflow-hidden px-2 pb-1 select-none sm:px-4">
        <span
          className="font-display block bg-clip-text text-center text-[clamp(3.5rem,19.5vw,17rem)] leading-[0.82] font-semibold tracking-[-0.055em] text-transparent blur-[1.5px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(94,230,160,0.34) 0%, rgba(242,247,244,0.22) 34%, rgba(242,247,244,0.07) 62%, rgba(242,247,244,0) 88%)",
          }}
        >
          INSTITUTE
        </span>
        <span
          aria-hidden
          className="from-ink-850 pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
        />
      </div>
    </footer>
  );
}
