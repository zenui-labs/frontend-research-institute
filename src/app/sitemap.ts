import type { MetadataRoute } from "next";
import { CASES, DOSSIERS, EXPERIMENTS, LABS, MYTHS } from "@/content";

import { SITE } from "@/lib/site";

const BASE = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/labs",
    "/experiments",
    "/detective",
    "/archives",
    "/myths",
    "/research",
    "/observatory",
    "/profile",
    "/about",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const dynamicRoutes = [
    ...LABS.filter((l) => l.status !== "CLASSIFIED").map((l) => `/labs/${l.slug}`),
    ...EXPERIMENTS.map((e) => `/experiments/${e.slug}`),
    ...CASES.map((c) => `/detective/${c.slug}`),
    ...MYTHS.map((m) => `/myths/${m.slug}`),
    ...DOSSIERS.map((d) => `/research/${d.slug}`),
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
