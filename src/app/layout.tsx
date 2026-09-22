import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/shell/nav";
import { Footer } from "@/components/shell/footer";
import { BootSequence } from "@/components/shell/boot-sequence";
import { SITE } from "@/lib/site";

/** Display: an experimental grotesque that stays legible at paragraph size. */
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/** Body: wide apertures, tall x-height, built for long reading. */
const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/** Technical: machine read-outs, IDs, measurements, code. */
const technical = JetBrains_Mono({
  variable: "--font-technical",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}, ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  category: "technology",
  authors: [{ name: SITE.creator, url: SITE.creatorUrl }],
  creator: SITE.creator,
  publisher: SITE.name,
  keywords: [
    "frontend engineering",
    "browser internals",
    "rendering pipeline",
    "stacking context",
    "event loop",
    "microtask queue",
    "React reconciliation",
    "React Fiber",
    "Core Web Vitals",
    "INP",
    "web performance",
    "CSS layout",
    "accessibility tree",
    "HTTP/3",
    "interactive learning",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name}, ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    creator: SITE.twitter,
    title: `${SITE.name}, ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#080b0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${technical.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          // Structured data is static and author-controlled.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE.name,
                alternateName: SITE.shortName,
                url: SITE.url,
                logo: `${SITE.url}/icon.svg`,
                description: SITE.description,
                founder: { "@type": "Organization", name: SITE.creator, url: SITE.creatorUrl },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE.name,
                url: SITE.url,
                inLanguage: "en",
                description: SITE.description,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${SITE.url}/experiments?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <a
          href="#main"
          className="focus:border-crt focus:bg-ink-850 focus:text-2xs focus:text-crt sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-200 focus:border focus:px-3 focus:py-2 focus:font-mono focus:tracking-[0.06em] focus:uppercase"
        >
          Skip to content
        </a>
        <BootSequence />
        <Nav />
        <main id="main" className="page-in relative z-10 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
