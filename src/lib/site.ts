/** Single source of truth for anything that ends up in a meta tag. */
export const SITE = {
  url: "https://frontendschool.zenui.net",
  name: "Frontend Research Institute",
  shortName: "FRI",
  tagline: "Investigate the Web. Break Things. Understand Why.",
  description:
    "A research institute for frontend engineering. Interactive experiments on browser rendering, CSS stacking contexts, the JavaScript event loop, React reconciliation, Core Web Vitals and network behaviour. Every claim is cited or reproducible in a bench.",
  locale: "en_GB",
  twitter: "@zenui_net",
  creator: "ZenUI",
  creatorUrl: "https://zenui.net",
  /** Change these two if you fork the institute. */
  repo: "https://github.com/zenui-labs/frontend-research-institute",
  license: "MIT",
} as const;

export const REPO = {
  root: SITE.repo,
  issues: `${SITE.repo}/issues`,
  contributing: `${SITE.repo}/blob/main/CONTRIBUTING.md`,
  license: `${SITE.repo}/blob/main/LICENSE`,
  newExperiment: `${SITE.repo}/issues/new?template=experiment_proposal.yml`,
  correction: `${SITE.repo}/issues/new?template=content_correction.yml`,
} as const;
