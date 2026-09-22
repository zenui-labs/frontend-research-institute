"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { EXPERIMENTS, LABS, experimentOfTheDay } from "@/content";
import { cn } from "@/lib/cn";
import { useMagnetic } from "@/lib/magnetic";
import { rankOf, useHydrated, useProgress } from "@/lib/progress";
import { GithubMark, InstituteMark, Wordmark } from "./logo";
import { REPO } from "@/lib/site";
import { SearchDialog } from "./search-dialog";
import { SoundToggle } from "./sound-toggle";

type MenuId = "labs" | "research";

const DIVISIONS = [
  { href: "/experiments", label: "Experiments", blurb: "Benches with a question and a method." },
  { href: "/detective", label: "Frontend Detective", blurb: "Real bugs, worked as case files." },
  { href: "/research", label: "Research dossiers", blurb: "Findings, limitations, references." },
  { href: "/myths", label: "Myth archive", blurb: "Claims examined, not repeated." },
  { href: "/archives", label: "Web archaeology", blurb: "The browser museum, by era." },
  { href: "/observatory", label: "Observatory", blurb: "Standing instruments, always on." },
] as const;

const STATUS_DOT: Record<string, string> = {
  OPERATIONAL: "bg-crt",
  CALIBRATING: "bg-amber",
  CLASSIFIED: "bg-steel-dim",
};

export function Nav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [pinned, setPinned] = useState(false);
  const hoverCapable = useRef(true);
  const closeTimer = useRef(0);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progress = useProgress();
  const hydrated = useHydrated();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    hoverCapable.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) closeMenu();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function closeMenu() {
    window.clearTimeout(closeTimer.current);
    setMenu(null);
    setPinned(false);
  }

  /** Hover opens instantly; leaving is forgiving so the pointer can cross the gap. */
  function openOnHover(id: MenuId) {
    if (!hoverCapable.current) return;
    window.clearTimeout(closeTimer.current);
    setMenu(id);
  }

  function scheduleClose() {
    if (!hoverCapable.current || pinned) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 160);
  }

  /** A click pins an already-open panel instead of closing it out from under the cursor. */
  function toggleMenu(id: MenuId) {
    window.clearTimeout(closeTimer.current);
    if (menu !== id) {
      setMenu(id);
      setPinned(true);
      return;
    }
    if (hoverCapable.current && !pinned) {
      setPinned(true);
      return;
    }
    closeMenu();
  }

  function closeAll() {
    closeMenu();
    setDrawer(false);
  }

  const labsActive = pathname.startsWith("/labs");
  const researchActive = DIVISIONS.some((d) => pathname.startsWith(d.href));

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled || menu
          ? "border-line bg-ink-900/85 backdrop-blur-xl"
          : "bg-ink-900/40 border-transparent backdrop-blur-md",
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-20 max-w-[1320px] items-center gap-3 px-4 sm:px-6">
        <Link href="/" onClick={closeAll} className="flex shrink-0 items-center gap-3">
          <InstituteMark />
          <Wordmark className="hidden sm:block" />
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-0.5 md:flex">
          <MenuTrigger
            id="labs"
            label="Laboratories"
            active={labsActive}
            open={menu === "labs"}
            onHover={() => openOnHover("labs")}
            onToggle={() => toggleMenu("labs")}
          />
          <MenuTrigger
            id="research"
            label="Research"
            active={researchActive}
            open={menu === "research"}
            onHover={() => openOnHover("research")}
            onToggle={() => toggleMenu("research")}
          />
          <Link
            href="/about"
            onClick={closeAll}
            onMouseEnter={() => closeMenu()}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm transition-colors",
              pathname === "/about" ? "text-crt" : "text-steel hover:text-bone",
            )}
          >
            About
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <SoundToggle />
          <a
            href={REPO.root}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Source on GitHub"
            title="Source on GitHub"
            className="border-line text-steel hover:border-line-bright hover:text-bone rounded-full border p-2 transition-colors"
          >
            <GithubMark className="h-4 w-4" />
          </a>
          <Link
            href="/profile"
            onClick={closeAll}
            className="border-line text-2xs text-steel hover:border-line-bright hover:text-bone hidden items-center gap-2 rounded-full border px-3 py-1.5 font-medium tracking-[0.08em] uppercase transition-colors lg:flex"
          >
            <span className="led bg-crt inline-block h-1.5 w-1.5 rounded-full" />
            <span className="font-mono tracking-normal">
              {hydrated ? progress.researchId : "FRI-------"}
            </span>
            <span className="text-steel-dim hidden xl:inline">
              {hydrated ? rankOf(progress).title : ""}
            </span>
          </Link>
          <button
            type="button"
            className="border-line text-bone hover:border-line-bright rounded-full border p-2 transition-colors md:hidden"
            aria-expanded={drawer}
            aria-controls="mobile-nav"
            aria-label={drawer ? "Close menu" : "Open menu"}
            onClick={() => setDrawer((v) => !v)}
          >
            {drawer ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Both panels stay mounted so open and close are both animated. */}
      {(["labs", "research"] as const).map((id) => (
        <div
          key={id}
          id={`menu-${id}`}
          data-open={menu === id ? "true" : "false"}
          aria-hidden={menu !== id}
          className="menu-surface border-line bg-ink-900 absolute inset-x-0 top-full z-40 hidden border-b shadow-[0_32px_60px_-40px_rgba(0,0,0,1)] md:block"
          onMouseEnter={() => {
            window.clearTimeout(closeTimer.current);
            setMenu(id);
          }}
        >
          <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
            {id === "labs" ? (
              <LabsMenu onNavigate={closeAll} />
            ) : (
              <ResearchMenu onNavigate={closeAll} />
            )}
          </div>
        </div>
      ))}

      {drawer ? (
        <nav
          id="mobile-nav"
          aria-label="Primary mobile"
          className="border-line bg-ink-850 border-t px-4 py-5 md:hidden"
        >
          <p className="label-tech mb-2.5">Divisions</p>
          <ul className="mb-6 grid grid-cols-2 gap-2">
            {DIVISIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeAll}
                  className="border-line text-bone hover:border-line-bright block rounded-[14px] border px-3 py-2.5 text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="label-tech mb-2.5">Laboratories</p>
          <ul className="grid grid-cols-2 gap-2">
            <li className="col-span-2">
              <Link
                href="/labs"
                onClick={closeAll}
                className="bg-sage text-crt block rounded-[14px] px-3 py-2.5 text-sm font-medium"
              >
                Facility map
              </Link>
            </li>
            {LABS.filter((lab) => lab.status !== "CLASSIFIED").map((lab) => (
              <li key={lab.slug}>
                <Link
                  href={`/labs/${lab.slug}`}
                  onClick={closeAll}
                  className="border-line text-bone hover:border-line-bright block rounded-[14px] border px-3 py-2.5 text-sm transition-colors"
                >
                  {lab.name}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/profile"
            onClick={closeAll}
            className="border-line text-steel mt-6 flex items-center justify-between rounded-[14px] border px-3 py-2.5 text-sm"
          >
            Research ID
            <span className="text-crt font-mono text-xs">
              {hydrated ? progress.researchId : "FRI-------"}
            </span>
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

function MenuTrigger({
  id,
  label,
  active,
  open,
  onHover,
  onToggle,
}: {
  id: MenuId;
  label: string;
  active: boolean;
  open: boolean;
  onHover: () => void;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={`menu-${id}`}
      onClick={onToggle}
      onMouseEnter={onHover}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors",
        open || active ? "text-crt" : "text-steel hover:text-bone",
      )}
    >
      {label}
      <ChevronDown
        size={13}
        aria-hidden
        className={cn("transition-transform duration-300", open && "rotate-180")}
      />
    </button>
  );
}

function FeaturePanel({ onNavigate }: { onNavigate: () => void }) {
  const magneticRef = useMagnetic<HTMLElement>(0.08, 5);
  const daily = experimentOfTheDay();

  return (
    <aside
      ref={magneticRef}
      className="magnetic border-line bg-ink-850 relative overflow-hidden rounded-[24px] border p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(94,230,160,0.18),transparent_70%)]"
      />
      <p className="label-tech relative">Experimental</p>

      <Link
        href={`/experiments/${daily.slug}`}
        onClick={onNavigate}
        className="relative mt-3 block"
      >
        <span className="font-display text-bone hover:text-crt block text-base font-semibold transition-colors">
          {daily.title}
        </span>
        <span className="text-steel mt-1 block text-xs">
          Experiment of the day · {daily.estimatedMinutes} min
        </span>
      </Link>

      <ul className="border-line relative mt-4 space-y-2 border-t pt-4">
        {[
          { href: "/observatory", label: "Dependency observatory", note: "Weigh a graph honestly" },
          {
            href: "/experiments/save-the-terrible-website",
            label: "Save the terrible website",
            note: "LCP 7.8s, and falling",
          },
          {
            href: "/experiments/main-thread-blocking-experiment",
            label: "Block the main thread",
            note: "Runs real work on your device",
          },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="hover:bg-ink-800 -mx-3 block rounded-[12px] px-3 py-2 transition-colors"
            >
              <span className="text-bone block text-sm">{item.label}</span>
              <span className="text-2xs text-steel-dim mt-0.5 block">{item.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function LabsMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <p className="label-tech">Ten laboratories</p>
          <Link
            href="/labs"
            onClick={onNavigate}
            className="text-crt text-xs font-medium transition-opacity hover:opacity-75"
          >
            Facility map →
          </Link>
        </div>
        <ul className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map((lab) => {
            const locked = lab.status === "CLASSIFIED";
            const inner = (
              <>
                <span className="flex items-center gap-2">
                  <span
                    className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[lab.status])}
                    aria-hidden
                  />
                  <span
                    className={cn("text-sm font-medium", locked ? "text-steel-dim" : "text-bone")}
                  >
                    {lab.name}
                  </span>
                </span>
                <span className="text-steel-dim mt-0.5 block pl-3.5 text-xs">{lab.tagline}</span>
              </>
            );
            return (
              <li key={lab.slug}>
                {locked ? (
                  <span className="block cursor-default rounded-[14px] px-3 py-2.5 opacity-55">
                    {inner}
                  </span>
                ) : (
                  <Link
                    href={`/labs/${lab.slug}`}
                    onClick={onNavigate}
                    className="hover:bg-ink-800 block rounded-[14px] px-3 py-2.5 transition-colors"
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <FeaturePanel onNavigate={onNavigate} />
    </div>
  );
}

function ResearchMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <p className="label-tech">Divisions</p>
          <span className="text-steel-dim text-xs">
            {EXPERIMENTS.length} experiments in circulation
          </span>
        </div>
        <ul className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
          {DIVISIONS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="hover:bg-ink-800 block rounded-[14px] px-3 py-2.5 transition-colors"
              >
                <span className="text-bone text-sm font-medium">{item.label}</span>
                <span className="text-steel-dim mt-0.5 block text-xs">{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <FeaturePanel onNavigate={onNavigate} />
    </div>
  );
}
