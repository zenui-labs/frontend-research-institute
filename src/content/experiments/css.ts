import type { Experiment } from "../types";

export const CSS_EXPERIMENTS: Experiment[] = [
  {
    id: "z-index-fails",
    number: 1,
    slug: "why-z-index-999999-loses",
    title: "Why can z-index: 999999 lose?",
    lab: "css",
    difficulty: "ENGINEER",
    estimatedMinutes: 9,
    type: "INTERACTIVE",
    summary:
      "Two overlapping elements. One asks for 999999. The other asks for 2. The 2 wins. Nothing is broken.",
    question:
      "An element with `z-index: 999999` is painted underneath an element with `z-index: 2`. No `!important`, no JavaScript, no browser bug. Why?",
    hypothesis:
      "z-index is not a global depth axis. It orders siblings inside one stacking context, and some innocuous-looking properties quietly create new ones.",
    concepts: ["stacking context", "painting order", "z-index", "containing block", "isolation"],
    prerequisites: ["Comfortable with `position` and basic CSS inheritance"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Two panels overlap. **Panel A** lives inside a wrapper and carries an absurd `z-index`. **Panel B** is a plain sibling of that wrapper. Toggle properties on the wrapper and watch which panel survives.",
        },
        { type: "sim", sim: "stacking-context", caption: "Stacking context bench. LAB-02" },
        {
          type: "steps",
          title: "Protocol",
          items: [
            "Start with a clean wrapper. Panel A (999999) paints above Panel B (2). Expected.",
            "Set `opacity: 0.99` on the wrapper. Panel A drops behind Panel B.",
            "Undo it. Try `transform: translateZ(0)`. Same result.",
            "Try `filter: blur(0px)`, `will-change: transform`, `isolation: isolate`, `contain: paint`.",
            "Now raise the wrapper's own z-index instead of Panel A's and watch the order restore.",
          ],
        },
      ],
      observation: [
        {
          type: "prose",
          text: "Every property in that list produces the same outcome: the wrapper becomes a **stacking context**, and Panel A's 999999 stops being comparable to Panel B's 2. The number did not shrink, it changed jurisdiction.",
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "z-index only sorts boxes that participate in the *same* stacking context. Across contexts, the whole context is sorted as one atomic unit by its own z-index and paint order.",
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "Painting is a tree walk, not a global sort. The browser paints the root stacking context, and whenever it meets an element that establishes a new stacking context it paints that element's entire subtree as a single unit before moving on. Descendant z-index values are resolved *inside* that unit and can never escape it.",
        },
        {
          type: "code",
          lang: "css",
          caption: "The minimal reproduction",
          code: `.wrapper {
 position: relative;
 opacity: 0.99; /* ← establishes a stacking context */
}

.panel-a {
 position: absolute;
 z-index: 999999; /* sorted only against siblings in .wrapper */
}

.panel-b {
 position: absolute;
 z-index: 2; /* sorted against .wrapper itself, which has z-index: auto */
}`,
        },
        {
          type: "prose",
          text: "Because `.wrapper` computes to `z-index: auto`, it is painted in the positioned-elements step at effectively level 0. `.panel-b` sits at level 2 in the *same* parent context, so it paints later, on top, and takes the entire wrapper subtree, 999999 included, with it.",
        },
        {
          type: "table",
          caption: "Simplified paint order inside one stacking context (CSS 2.1, Appendix E)",
          head: ["Step", "What is painted"],
          rows: [
            ["1", "Background and borders of the element forming the context"],
            ["2", "Child stacking contexts with negative z-index"],
            ["3", "In-flow, non-inline-level, non-positioned descendants"],
            ["4", "Non-positioned floats"],
            ["5", "In-flow inline-level, non-positioned descendants"],
            ["6", "Positioned descendants with z-index: auto or 0"],
            ["7", "Child stacking contexts with positive z-index, ascending"],
          ],
        },
        {
          type: "why",
          question: "Why does opacity create a stacking context at all?",
          chain: {
            answer:
              "Because the element's subtree has to be composited as one image before the opacity is applied.",
            next: {
              answer:
                "Blending a group at 50% is not the same as blending each descendant at 50%, overlapping children would show through each other. The group must be flattened first.",
              next: {
                answer:
                  "Flattening requires a well-defined set of things to flatten, in a fixed paint order. That set is exactly a stacking context.",
                next: {
                  answer:
                    "So any property that needs group semantics, opacity, filter, mix-blend-mode, mask, transform, isolation, must define a group. Creating a stacking context is how CSS spells 'group'.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "The practical consequence: a modal, dropdown or tooltip can never escape an ancestor stacking context by raising its z-index. The fixes are structural, move the element out of the subtree (a portal), stop the ancestor from creating a context, or raise the ancestor itself.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Known trap",
          text: "`position: fixed` inside an ancestor with a transform, filter or `will-change: transform` is also affected: that ancestor becomes the containing block, so the fixed element scrolls with it and is trapped in its stacking context.",
        },
        {
          type: "callout",
          variant: "joke",
          text: "RESEARCH NOTE: Raising z-index to 2147483647 has never once solved this. We keep the specimen anyway.",
        },
      ],
    },
    references: [
      {
        label: "The stacking context",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context",
      },
      {
        label: "Elaborate description of stacking contexts",
        source: "CSS 2.1. Appendix E",
        url: "https://www.w3.org/TR/CSS21/zindex.html",
      },
      {
        label: "CSS Positioned Layout Level 3",
        source: "W3C",
        url: "https://www.w3.org/TR/css-position-3/",
      },
    ],
    related: ["stacking-creators", "render-invalidation", "box-overflow"],
  },
  {
    id: "stacking-creators",
    number: 2,
    slug: "what-creates-a-stacking-context",
    title: "What actually creates a stacking context?",
    lab: "css",
    difficulty: "ENGINEER",
    estimatedMinutes: 7,
    type: "INTERACTIVE",
    summary:
      "A field guide to the twenty-odd declarations that quietly reorganise your paint order.",
    question:
      "Most developers can name two: `position` with `z-index`, and `opacity`. The real list is much longer, and several entries look completely harmless.",
    hypothesis:
      "Anything that forces the browser to treat a subtree as one composited group establishes a stacking context.",
    concepts: ["stacking context", "compositing", "containment", "will-change"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Toggle declarations on the wrapper element. The bench reports whether a stacking context now exists and why.",
        },
        { type: "sim", sim: "stacking-creators", caption: "Context detector. LAB-02" },
      ],
      observation: [
        {
          type: "prose",
          text: "Three families emerge. **Group semantics** (opacity, filter, blend, mask) need a flattened subtree. **Compositing hints** (transform, will-change, backdrop-filter) promote the subtree toward its own layer. **Containment** (`contain: paint`, `content-visibility`) promises the browser that nothing paints outside the box, a promise only meaningful for a well-defined group.",
        },
      ],
      explanation: [
        {
          type: "table",
          caption: "Non-exhaustive, but covers what you will actually meet",
          head: ["Declaration", "Family", "Notes"],
          rows: [
            ["position: relative/absolute + z-index ≠ auto", "classic", "The one everybody knows"],
            ["position: fixed / sticky", "classic", "Always, regardless of z-index"],
            ["opacity < 1", "group", "Even 0.999"],
            ["transform ≠ none", "compositing", "Including translateZ(0)"],
            ["filter / backdrop-filter ≠ none", "group", "Even blur(0px)"],
            ["mix-blend-mode ≠ normal", "group", "Needs a backdrop group"],
            ["isolation: isolate", "group", "Its only job"],
            ["will-change: <a context-creating property>", "compositing", "Creates it eagerly"],
            [
              "contain: paint / layout / strict / content",
              "containment",
              "Paint containment implies a context",
            ],
            ["content-visibility: auto/hidden", "containment", "Implies containment"],
            ["flex/grid child with z-index ≠ auto", "classic", "No positioning required"],
            ["mask / clip-path / mask-image ≠ none", "group", "Group must be flattened to clip"],
            [
              "element in the top layer (dialog, popover)",
              "special",
              "Painted above everything else entirely",
            ],
          ],
        },
        {
          type: "callout",
          variant: "model",
          title: "Simplified model",
          text: "If a property could change how the subtree blends with what is behind it, or promises the browser something about the subtree as a whole, assume it creates a stacking context.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "`will-change` deserves a warning of its own. It is a hint with a cost: the browser may promote the element to its own compositor layer and hold the memory for as long as the declaration is there. Applying `will-change: transform` to everything is one of the more reliable ways to make a page slower while believing you optimised it.",
        },
      ],
    },
    references: [
      {
        label: "The stacking context, creating rules",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context",
      },
      {
        label: "CSS Containment Module Level 2",
        source: "W3C",
        url: "https://www.w3.org/TR/css-contain-2/",
      },
      {
        label: "will-change",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/will-change",
      },
    ],
    related: ["z-index-fails", "render-invalidation"],
  },
  {
    id: "box-overflow",
    number: 3,
    slug: "why-width-100-percent-overflows",
    title: "Why does width: 100% overflow?",
    lab: "css",
    difficulty: "CURIOUS",
    estimatedMinutes: 6,
    type: "INTERACTIVE",
    summary:
      "The child was told to be exactly as wide as its parent. It is now wider than its parent. Both are correct.",
    question:
      "A child with `width: 100%` sits inside a parent of fixed width, and a horizontal scrollbar appears. Where did the extra pixels come from?",
    hypothesis:
      "`width` sets the content box by default. Padding and border are added *after*, so 100% + any padding is always larger than the parent's content box.",
    concepts: ["box model", "box-sizing", "containing block", "percentage resolution"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Drag the padding, border and width controls. The bench reports the used dimensions of every box edge and whether overflow occurs.",
        },
        { type: "sim", sim: "box-overflow", caption: "Box model bench. LAB-02" },
      ],
      observation: [
        {
          type: "prose",
          text: "With the default `box-sizing: content-box`, the rendered width is `width + padding-left + padding-right + border-left + border-right`. Setting `box-sizing: border-box` makes `width` describe the border box instead, and padding is taken out of the inside.",
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "A percentage `width` resolves against the **content box of the containing block**, not its border box, and not the viewport.",
        },
      ],
      explanation: [
        {
          type: "code",
          lang: "css",
          code: `.parent { width: 320px; } /* content box: 320px */

.child {
 width: 100%; /* → 320px of content */
 padding: 0 16px; /* + 32px */
 border: 1px solid; /* + 2px */
 /* used border-box width: 354px → 34px of overflow */
}`,
        },
        {
          type: "prose",
          text: "Margins are a separate story: they are never part of `width`, so `width: 100%` plus any horizontal margin always overflows, regardless of `box-sizing`.",
        },
        {
          type: "table",
          head: ["Situation", "Result"],
          rows: [
            ["content-box + padding", "Overflows by the padding + border"],
            ["border-box + padding", "Fits; content area shrinks instead"],
            ["Any box-sizing + horizontal margin", "Overflows by the margin"],
            ["`width: auto` on a block", "Fits automatically, the box solves for you"],
            ["Replaced element (img) at 100%", "Fits if `max-width: 100%` and no extra padding"],
          ],
        },
        {
          type: "callout",
          variant: "note",
          title: "The boring correct answer",
          text: "For block-level boxes, deleting `width: 100%` usually fixes the bug. A block box already fills its containing block, and `auto` widths absorb padding and margins instead of fighting them.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "The second most common source of mystery overflow is a scrollbar. In classic scrollbars, `100vw` includes the scrollbar gutter while `100%` of `<body>` does not, so `width: 100vw` on a page that scrolls vertically produces exactly one scrollbar's worth of horizontal overflow. `scrollbar-gutter: stable` and the `dvw`/`svw` units exist because of this.",
        },
      ],
    },
    references: [
      {
        label: "box-sizing",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing",
      },
      {
        label: "CSS Box Sizing Module Level 3",
        source: "W3C",
        url: "https://www.w3.org/TR/css-sizing-3/",
      },
      {
        label: "Containing block",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Containing_block",
      },
    ],
    related: ["intrinsic-sizing", "z-index-fails"],
  },
  {
    id: "intrinsic-sizing",
    number: 4,
    slug: "how-intrinsic-sizing-works",
    title: "How does intrinsic sizing work?",
    lab: "css",
    difficulty: "DEVELOPER",
    estimatedMinutes: 8,
    type: "INTERACTIVE",
    summary:
      "min-content, max-content, fit-content, and the `min-width: auto` rule that makes flex items refuse to shrink.",
    question:
      "A flex item containing a long string blows out of its container even though it has `width: 100%` and `overflow: hidden`. Why won't it shrink?",
    hypothesis:
      "Flex and grid items have an automatic minimum size equal to their min-content size. Until you override it, the item cannot become smaller than its longest unbreakable word.",
    concepts: ["min-content", "max-content", "fit-content", "automatic minimum size", "flexbox"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Resize the container and switch the item's sizing keyword. Watch where the content wraps, and what `min-width: auto` does to a flex item.",
        },
        { type: "sim", sim: "intrinsic-sizing", caption: "Intrinsic sizing bench. LAB-02" },
      ],
      observation: [
        {
          type: "table",
          head: ["Keyword", "Meaning", "Roughly"],
          rows: [
            [
              "min-content",
              "Smallest size without overflowing content",
              "The longest unbreakable word",
            ],
            ["max-content", "Size if it never wrapped", "The whole string on one line"],
            ["fit-content", "clamp(min-content, available, max-content)", "Shrink-to-fit"],
            [
              "auto (flex item)",
              "Resolves to the content-based minimum size",
              "Usually min-content",
            ],
          ],
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "Flex items get `min-width: auto` in the inline axis by default, and `auto` resolves to a content-based minimum. That is why `flex: 1` alone does not let a cell shrink below its longest word, and why every truncation recipe on the internet contains the same line:",
        },
        {
          type: "code",
          lang: "css",
          code: `.flex-child {
 flex: 1;
 min-width: 0; /* opt out of the automatic minimum size */
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
}

/* Grid equivalent: 1fr means minmax(auto, 1fr) */
.grid { grid-template-columns: minmax(0, 1fr) auto; }`,
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "`1fr` in grid is shorthand for `minmax(auto, 1fr)`. The `auto` minimum is the same content-based floor, which is why `minmax(0, 1fr)` is the grid version of `min-width: 0`.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Intrinsic sizes are expensive: computing `max-content` requires laying out the content as if the line were infinite. Browsers cache them aggressively, but a deeply nested `fit-content`/`auto` table-like structure can force repeated intrinsic passes. If layout is your bottleneck, replacing `auto` columns with explicit tracks is often the single biggest win.",
        },
      ],
    },
    references: [
      {
        label: "CSS Box Sizing Module Level 3, intrinsic sizes",
        source: "W3C",
        url: "https://www.w3.org/TR/css-sizing-3/#intrinsic-sizes",
      },
      {
        label: "min-width: auto on flex items",
        source: "CSS Flexbox Level 1",
        url: "https://www.w3.org/TR/css-flexbox-1/#min-size-auto",
      },
      {
        label: "minmax()",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/minmax",
      },
    ],
    related: ["box-overflow", "render-invalidation"],
  },
];
