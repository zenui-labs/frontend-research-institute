export type ResearchRank = {
  title: string;
  min: number;
  blurb: string;
};

/** Plain data, deliberately outside the client-only progress module. */
export const RANKS: ResearchRank[] = [
  { title: "Visitor", min: 0, blurb: "Signed the guest book. Touched nothing yet." },
  { title: "Lab Assistant", min: 2, blurb: "Allowed to press buttons under supervision." },
  { title: "Junior Researcher", min: 5, blurb: "Has opinions about the box model." },
  { title: "Browser Scientist", min: 9, blurb: "Reads rendering pipelines for fun." },
  {
    title: "Senior Investigator",
    min: 14,
    blurb: "Suspects every bug of being a stacking context.",
  },
  { title: "Principal Researcher", min: 20, blurb: "Cites specifications in casual conversation." },
  { title: "Director of Strange Behaviour", min: 28, blurb: "The institute now answers to you." },
];
