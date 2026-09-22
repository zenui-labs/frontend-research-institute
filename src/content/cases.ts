import type { DetectiveCase } from "./types";

export const CASES: DetectiveCase[] = [
  {
    id: "missing-button",
    number: 317,
    slug: "the-missing-button",
    title: "The Missing Button",
    lab: "css",
    difficulty: "DEVELOPER",
    status: "UNSOLVED",
    brief:
      "The button is in the DOM. The CSS says it is visible. Nobody can see it. The developer insists everything is correct, and the developer is telling the truth.",
    scene: [
      {
        type: "prose",
        text: "A checkout page. The 'Complete order' button renders on the developer's machine and vanishes in production for roughly 4% of sessions. There is no JavaScript error. The element is present in the inspector, highlighted, with a real bounding box.",
      },
      {
        type: "code",
        lang: "html",
        caption: "Markup, exactly as served",
        code: `<div class="checkout-footer">
 <p class="legal">By continuing you agree to the terms.</p>
 <button class="cta">Complete order</button>
</div>`,
      },
      {
        type: "code",
        lang: "css",
        caption: "Relevant styles, exactly as served",
        code: `.checkout-footer {
 height: 72px;
 overflow: hidden;
 padding: 16px;
}

.legal { font-size: 13px; line-height: 1.5; }

.cta {
 display: block;
 opacity: 1;
 visibility: visible;
 color: #fff;
 background: #1b5e20;
}`,
      },
    ],
    clues: [
      {
        id: "computed",
        label: "Read the computed styles",
        finding:
          "display: block. visibility: visible. opacity: 1. color has sufficient contrast. Nothing here hides the element.",
        weight: "noise",
      },
      {
        id: "box",
        label: "Measure the box",
        finding:
          "The button reports 168 × 40 at y = 96px inside a parent whose content box ends at y = 72px. The button exists, below the fold of its own container.",
        weight: "evidence",
      },
      {
        id: "overflow",
        label: "Inspect the parent's overflow",
        finding:
          "`.checkout-footer` has a fixed 72px height and `overflow: hidden`. Anything past 72px is clipped, silently, with no scrollbar and no warning.",
        weight: "evidence",
      },
      {
        id: "locale",
        label: "Check the failing sessions",
        finding:
          "All failing sessions render the legal text in German or Finnish, where the sentence wraps to two lines. Two lines of legal text push the button past 72px.",
        weight: "evidence",
      },
      {
        id: "zindex",
        label: "Suspect z-index",
        finding:
          "No stacking context anywhere near the footer, and no overlapping element. z-index is not involved.",
        weight: "noise",
      },
      {
        id: "js",
        label: "Check for JavaScript interference",
        finding: "No script touches .cta after hydration. The console is clean.",
        weight: "noise",
      },
    ],
    suspects: [
      {
        id: "display-none",
        label: "Something set display: none",
        culprit: false,
        verdict:
          "Computed styles say otherwise, and a display:none element would have no box to measure.",
      },
      {
        id: "z-index",
        label: "A stacking context buried it",
        culprit: false,
        verdict: "Nothing overlaps it. The button is not behind anything, it is outside something.",
      },
      {
        id: "overflow-clip",
        label: "A fixed-height ancestor with overflow: hidden clipped it",
        culprit: true,
        verdict:
          "Correct. The footer's 72px height was derived from a one-line legal string in English. Translation added a second line, the button moved past the clip boundary, and `overflow: hidden` removed it without a trace.",
      },
      {
        id: "contrast",
        label: "White text on a white background",
        culprit: false,
        verdict: "Contrast is 8.3:1. Visible, if it were on screen at all.",
      },
    ],
    resolution: [
      {
        type: "prose",
        text: "The bug is a fixed height chosen from one language's line count, combined with `overflow: hidden`, a pairing that fails silently by design. Clipping is not an error condition; the browser has no way to tell you that content was discarded.",
      },
      {
        type: "code",
        lang: "css",
        caption: "The fix, and the guard that prevents the next one",
        code: `.checkout-footer {
 min-height: 72px; /* a floor, not a ceiling */
 /* overflow: hidden removed, nothing needed clipping here */
 display: flex;
 flex-wrap: wrap;
 gap: 12px;
 align-items: center;
 padding: 16px;
}`,
      },
      {
        type: "callout",
        variant: "note",
        title: "Investigative principle",
        text: "When an element has a box but no pixels, stop looking at the element. The cause is almost always an ancestor: clipping, a zero-size parent, a transform moving it off screen, or a containing block you did not expect.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Pattern to recognise",
        text: "Fixed heights are a bet on content length. Translation, user-generated text and larger default font sizes all cash that bet. `min-height` keeps the intent without the bet.",
      },
    ],
    references: [
      {
        label: "overflow",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/overflow",
      },
      {
        label: "Text expansion in localisation",
        source: "W3C i18n",
        url: "https://www.w3.org/International/articles/article-text-size",
      },
    ],
  },
  {
    id: "double-submit",
    number: 288,
    slug: "the-order-that-was-placed-twice",
    title: "The Order That Was Placed Twice",
    lab: "architecture",
    difficulty: "SYSTEMS",
    status: "UNSOLVED",
    brief:
      "One customer. One click. Two charges. The button has a disabled state and the developer added it specifically to prevent this.",
    scene: [
      {
        type: "prose",
        text: "Support reports duplicate orders at a rate of about 1 in 900. The handler disables the button on submit. Logs show two POST requests, 40ms apart, from the same session, with identical bodies.",
      },
      {
        type: "code",
        lang: "jsx",
        caption: "The handler in question",
        code: `function Checkout() {
 const [busy, setBusy] = useState(false);

 async function submit() {
 if (busy) return;
 setBusy(true);
 await placeOrder(cart);
 setBusy(false);
 }

 return <button onClick={submit} disabled={busy}>Place order</button>;
}`,
      },
    ],
    clues: [
      {
        id: "timing",
        label: "Compare the two request timestamps",
        finding:
          "40ms apart, faster than a human double click on most devices, but well within the range of a fast double tap, and identical to the gap seen when a touch event is followed by a synthesised click.",
        weight: "evidence",
      },
      {
        id: "state",
        label: "Trace the guard",
        finding:
          "`busy` is read from the closure captured at render time. Both handler invocations run before React commits the state update, so both see `busy === false`.",
        weight: "evidence",
      },
      {
        id: "network",
        label: "Check for retries",
        finding:
          "No client retry logic. But the load balancer retries idempotent requests on 502, and POST /orders was not marked non-idempotent.",
        weight: "evidence",
      },
      {
        id: "cache",
        label: "Suspect the CDN",
        finding: "POST is never cached. The CDN is not involved.",
        weight: "noise",
      },
      {
        id: "react",
        label: "Suspect StrictMode double-invocation",
        finding:
          "StrictMode double-invokes render and effects in development only. This is production, and an onClick handler is not double-invoked regardless.",
        weight: "noise",
      },
    ],
    suspects: [
      {
        id: "strictmode",
        label: "React StrictMode fired the handler twice",
        culprit: false,
        verdict: "Development-only behaviour, and it never applies to event handlers.",
      },
      {
        id: "stale-guard",
        label: "The in-render guard cannot stop a second event in the same tick",
        culprit: true,
        verdict:
          "Correct, and it is only half the answer. A state-based guard updates asynchronously, so two events in the same frame both pass it. The real fix is server-side idempotency; the client guard is a courtesy, not a correctness mechanism.",
      },
      {
        id: "network-retry",
        label: "The infrastructure retried the request",
        culprit: true,
        verdict:
          "Also correct. Any layer between the user and your handler may retry. Without an idempotency key, a retry and a duplicate are indistinguishable to the server.",
      },
      {
        id: "cache",
        label: "A cache replayed the request",
        culprit: false,
        verdict: "POST responses are not cached by shared caches by default.",
      },
    ],
    resolution: [
      {
        type: "prose",
        text: "Two independent causes, one symptom. Guarding in component state is racy because the guard is not applied until React commits. Guarding only on the client is insufficient regardless, because the network is allowed to deliver your request more than once.",
      },
      {
        type: "code",
        lang: "jsx",
        caption: "Client: a synchronous guard plus a stable idempotency key",
        code: `const inFlight = useRef(false);
const keyRef = useRef(crypto.randomUUID());

async function submit() {
 if (inFlight.current) return; // synchronous, no render needed
 inFlight.current = true;
 try {
 await placeOrder(cart, { idempotencyKey: keyRef.current });
 } finally {
 inFlight.current = false;
 }
}`,
      },
      {
        type: "code",
        lang: "http",
        caption: "Server: the only guarantee that actually holds",
        code: `POST /orders
Idempotency-Key: 0f1c...c3

# First request with this key → create the order, store the response
# Any later request with the same key → return the stored response,
# create nothing`,
      },
      {
        type: "callout",
        variant: "fact",
        title: "Distributed systems rule",
        text: "At-least-once delivery is the realistic default. Exactly-once is achieved by making the operation idempotent at the destination, not by trying harder to send it once.",
      },
    ],
    references: [
      {
        label: "Idempotency-Key header",
        source: "IETF draft",
        url: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/",
      },
      { label: "useRef", source: "React docs", url: "https://react.dev/reference/react/useRef" },
    ],
  },
  {
    id: "phantom-scroll",
    number: 402,
    slug: "the-phantom-horizontal-scrollbar",
    title: "The Phantom Horizontal Scrollbar",
    lab: "css",
    difficulty: "DEVELOPER",
    status: "UNSOLVED",
    brief:
      "A horizontal scrollbar appears on mobile. Every element inspected fits. The page scrolls sideways by exactly 17 pixels, and nobody can find the culprit.",
    scene: [
      {
        type: "prose",
        text: "The page looks correct. `document.body.scrollWidth` is 17px wider than `clientWidth`. Setting `overflow-x: hidden` on the body makes the symptom disappear and the team is about to ship that.",
      },
    ],
    clues: [
      {
        id: "measure",
        label: "Find the widest element programmatically",
        finding:
          "A one-line audit in the console finds a decorative element positioned at `left: 100%` with a 120px width, off-screen to the right, but still part of the scrollable overflow area.",
        weight: "evidence",
      },
      {
        id: "vw",
        label: "Look for 100vw",
        finding:
          "A full-bleed section uses `width: 100vw`. With classic scrollbars, 100vw includes the vertical scrollbar gutter while the body's width does not, a difference of exactly the scrollbar width.",
        weight: "evidence",
      },
      {
        id: "hidden",
        label: "Consider overflow-x: hidden on body",
        finding:
          "It hides the symptom. It also creates a scroll container, which breaks `position: sticky` in descendants and can disable smooth scroll anchoring.",
        weight: "noise",
      },
      {
        id: "negative-margin",
        label: "Audit negative margins",
        finding:
          "A `-16px` right margin on a grid inside a padded container, harmless here, it stays within the padding.",
        weight: "noise",
      },
    ],
    suspects: [
      {
        id: "vw",
        label: "100vw includes the scrollbar gutter",
        culprit: true,
        verdict:
          "Correct for the exact-17px signature. Use `100%`, or `width: 100dvw` with care, or the modern `scrollbar-gutter: stable`, and prefer a full-bleed technique that does not depend on viewport units.",
      },
      {
        id: "absolute",
        label: "An absolutely positioned decoration extends the scroll area",
        culprit: true,
        verdict:
          "Also correct, and the more common cause in general. Off-screen decorations must be clipped by a positioned ancestor with `overflow: hidden` (or `clip`), not left to the document.",
      },
      {
        id: "body-hidden",
        label: "Fix it with overflow-x: hidden on body",
        culprit: false,
        verdict:
          "Not a fix, a mute button. It makes the page a scroll container and quietly breaks sticky positioning, which is a worse bug that appears later and looks unrelated.",
      },
    ],
    resolution: [
      {
        type: "code",
        lang: "js",
        caption: "The audit worth keeping in a snippet",
        code: `const docWidth = document.documentElement.clientWidth;
document.querySelectorAll("*").forEach((el) => {
 const r = el.getBoundingClientRect();
 if (r.right > docWidth + 1 || r.left < -1) console.log(el, r.left, r.right);
});`,
      },
      {
        type: "prose",
        text: "Overflow is caused by a box, and a box can always be found. `overflow: clip` is usually the better containment tool than `overflow: hidden`: it clips without creating a scroll container, so sticky positioning and scroll anchoring keep working.",
      },
      {
        type: "callout",
        variant: "joke",
        text: "CASE NOTE: 17 pixels. Always 17 pixels. The institute has a small shrine.",
      },
    ],
    references: [
      {
        label: "overflow: clip",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/overflow",
      },
      {
        label: "scrollbar-gutter",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter",
      },
      {
        label: "Viewport units",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths",
      },
    ],
  },
];
