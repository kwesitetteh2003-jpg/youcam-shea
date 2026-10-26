import { useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PlanSection } from "./components/PlanSection";
import { TryOn } from "./components/TryOn";
import { Story } from "./components/Story";
import { How } from "./components/How";
import { Closing, Footer } from "./components/Footer";
import { useShea } from "./lib/useShea";
import { startSmoothScroll } from "./lib/smooth";

export default function App() {
  const shea = useShea();
  useEffect(() => startSmoothScroll(), []);
  const busy = !["idle", "done", "error"].includes(shea.phase);
  return (
    <div id="top" className="grain">
      <a href="#scan" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">Skip to the scanner</a>
      <Header mode={shea.mode} />
      <main>
        <Hero shea={shea} />
        <PlanSection plan={shea.plan} busy={busy} />
        <Story />
        <TryOn picks={shea.plan?.garments} skin={shea.tone?.skin} mode={shea.mode} />
        <How />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
