import type { Mode } from "../../shared/types";

export function Header({ mode }: { mode: Mode | "unknown" }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b rule bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2" aria-label="Shea, home">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="11" fill="none" stroke="var(--color-ochre)" strokeWidth="3" /><circle cx="16" cy="16" r="4" fill="var(--color-ink)" /></svg>
          <span className="display text-[1.35rem] font-semibold leading-none">Shea</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex" aria-label="Sections">
          <a href="#scan" className="hover:text-ink">Scan</a><a href="#plan" className="hover:text-ink">Plan</a>
          <a href="#tryon" className="hover:text-ink">Try-on</a><a href="#how" className="hover:text-ink">How it works</a>
        </nav>
        <span data-testid="mode-pill" className="flex items-center gap-2 rounded-full border rule px-3 py-1 text-xs font-medium text-ink-2"
          title={mode === "live" ? "Calls go to the YouCam API" : "No YouCam key set: sample data"}>
          <span className={`h-1.5 w-1.5 rounded-full ${mode === "live" ? "bg-leaf" : "bg-ochre"}`} />
          {mode === "live" ? "Live · YouCam API" : mode === "demo" ? "Demo · sample data" : "Connecting"}
        </span>
      </div>
    </header>
  );
}
