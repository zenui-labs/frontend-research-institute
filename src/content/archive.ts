import type { Artifact } from "./types";

export const ARTIFACTS: Artifact[] = [
  {
    id: "tables",
    slug: "table-layout",
    name: "Table-based layout",
    era: "The Grid Before Grid",
    year: 1996,
    status: "EXTINCT",
    summary:
      "Before CSS could position anything reliably, the only cross-browser layout primitive was a data table with invisible borders, nested four deep, held together with 1×1 transparent GIFs.",
    epitaph: "Died of semantics. Survived by <div>, which learned nothing.",
    legacy:
      "Established that layout needs a two-dimensional model. CSS Grid is, in a real sense, the feature people were asking for in 1996, arriving twenty years later with the semantics fixed.",
  },
  {
    id: "spacer-gif",
    slug: "spacer-gif",
    name: "spacer.gif",
    era: "The Grid Before Grid",
    year: 1997,
    status: "EXTINCT",
    summary:
      "A 43-byte transparent GIF, stretched with width and height attributes to force whitespace. Every commercial website of the era shipped hundreds of them.",
    epitaph: "The original layout hack. Replaced by a property called margin.",
    legacy:
      "A permanent reminder that when a platform lacks a primitive, developers will invent one out of whatever is available, and it will be worse.",
  },
  {
    id: "websafe",
    slug: "web-safe-colors",
    name: "The 216 web-safe colours",
    era: "The Grid Before Grid",
    year: 1994,
    status: "EXTINCT",
    summary:
      "A palette designed so images would not dither on 8-bit displays. #CC33FF was a design decision, not an accident.",
    epitaph: "Outlived by exactly one of its members: #FFFFFF.",
    legacy:
      "The first widely adopted design-token system on the web, born from a hardware constraint that vanished within a decade.",
  },
  {
    id: "frames",
    slug: "frames",
    name: "<frameset>",
    era: "Structural Experiments",
    year: 1996,
    status: "EXTINCT",
    summary:
      "Multiple independent documents in one window, each with its own scroll position and its own URL, none of which the address bar acknowledged.",
    epitaph: "Broke bookmarking, printing, search and the back button. Removed in HTML5.",
    legacy:
      "Every problem framesets caused, deep linking, history, focus management, scroll restoration, is a problem single-page applications had to solve again from scratch.",
  },
  {
    id: "flash",
    slug: "flash",
    name: "Adobe Flash",
    era: "The Plugin Age",
    year: 1996,
    status: "EXTINCT",
    summary:
      "A vector animation runtime with its own language, timeline, audio stack and rendering engine, running inside a plugin the browser knew nothing about. For a decade it was the only way to do animation, video or games on the web.",
    epitaph:
      "End of life 31 December 2020. It taught the web what it was missing, then was replaced by it.",
    legacy:
      "Canvas, WebGL, the Web Animations API, WebAudio, the video element and WebAssembly are all, in part, the open platform catching up to what Flash demonstrated was possible.",
  },
  {
    id: "ie6",
    slug: "internet-explorer-6",
    name: "Internet Explorer 6",
    era: "The Plugin Age",
    year: 2001,
    status: "EXTINCT",
    summary:
      "Shipped in 2001 with roughly 90% market share, then received no meaningful update for five years. Its broken box model, hasLayout quirk and PNG alpha handling defined a generation of CSS hacks.",
    epitaph: "Support finally ended in 2022. Several developers held parties.",
    legacy:
      "Produced graceful degradation, feature detection, polyfills, and an industry-wide conviction that evergreen browsers are worth almost any cost.",
  },
  {
    id: "jquery",
    slug: "jquery",
    name: "jQuery",
    era: "The Library Era",
    year: 2006,
    status: "STILL BREATHING",
    summary:
      "One function that made the DOM tolerable and browser differences invisible. `$('.thing').fadeIn()` did in one line what took thirty lines of branching code per browser.",
    epitaph: "Not dead. Still running on a large share of the web, quietly, doing its job.",
    legacy:
      "querySelectorAll, classList, fetch and Element.closest are all jQuery features that were absorbed into the platform. Its greatest success is that it argued itself out of necessity.",
  },
  {
    id: "ajax",
    slug: "xmlhttprequest",
    name: "XMLHttpRequest / AJAX",
    era: "The Library Era",
    year: 1999,
    status: "MUTATED",
    summary:
      "Shipped in Internet Explorer 5 as an ActiveX control for Outlook Web Access, then reverse-engineered by everyone else. Google Maps made the technique famous in 2005 and the term AJAX was coined the same year.",
    epitaph: "Superseded by fetch(), which is the same idea with promises and a sane API.",
    legacy:
      "The single change that turned the web from a document system into an application platform. Everything since is a refinement of 'update part of the page without reloading it'.",
  },
  {
    id: "responsive",
    slug: "responsive-web-design",
    name: "Responsive Web Design",
    era: "The Modern Web",
    year: 2010,
    status: "STILL BREATHING",
    summary:
      "Ethan Marcotte's article combined fluid grids, flexible images and media queries into one idea, and ended the industry practice of building a separate m-dot site.",
    epitaph:
      "Not archived, absorbed. Nobody says 'responsive' any more because nothing else is acceptable.",
    legacy:
      "Container queries, logical properties and intrinsic sizing are the same principle applied at component scale rather than page scale.",
  },
  {
    id: "spa",
    slug: "the-spa-era",
    name: "The Single Page Application",
    era: "The Modern Web",
    year: 2010,
    status: "MUTATED",
    summary:
      "Move routing, rendering and state to the client, ship an empty div, and rebuild the browser's navigation model in JavaScript. It solved real problems and created an equal number of new ones.",
    epitaph:
      "Not dead, recompiled. Server rendering, streaming and islands are the industry's revision notes.",
    legacy:
      "Every framework since has been negotiating the same trade-off: how much of the application belongs on the server, and how much genuinely needs to run in the browser.",
  },
  {
    id: "quirks",
    slug: "quirks-mode",
    name: "Quirks mode",
    era: "Structural Experiments",
    year: 1999,
    status: "ARCHIVED",
    summary:
      "A whole second rendering mode, entered by omitting a doctype, that reproduced Netscape 4 and IE 5 bugs on purpose so older pages would keep working.",
    epitaph:
      "Still implemented in every browser you use. It has simply been very quiet for twenty years.",
    legacy:
      "The canonical example of the web's core commitment: do not break existing content. The whole platform's design is constrained by it.",
  },
  {
    id: "appcache",
    slug: "application-cache",
    name: "Application Cache (appcache)",
    era: "The Modern Web",
    year: 2010,
    status: "EXTINCT",
    summary:
      "A manifest file for offline web apps whose failure modes were so unintuitive that the standard reference article on it was titled after a swear word.",
    epitaph: "Removed from browsers. Replaced by service workers, which are harder and correct.",
    legacy:
      "Proof that a declarative API for a genuinely complex problem can be worse than an imperative one. Service workers gave developers the event loop instead of a manifest, and offline finally worked.",
  },
];

export const ARCHIVE_ERAS = [
  "The Grid Before Grid",
  "Structural Experiments",
  "The Plugin Age",
  "The Library Era",
  "The Modern Web",
] as const;
