import { useCallback, useEffect, useRef, useState } from "react";
import type { Mode, Plan, SkinResult, ToneResult } from "../../shared/types";
import { getStatus, makePlan, scan, toJpegDataUrl } from "./api";

export type Phase = "idle" | "preparing" | "uploading" | "reading" | "planning" | "done" | "error";
export interface Subject { kind: "sample" | "user"; src: string }
export const SAMPLE: Subject = { kind: "sample", src: "/photos/face-scan-720.webp" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useShea() {
  const [mode, setMode] = useState<Mode | "unknown">("unknown");
  const [phase, setPhase] = useState<Phase>("idle");
  const [subject, setSubject] = useState<Subject>(SAMPLE);
  const [skin, setSkin] = useState<SkinResult>();
  const [tone, setTone] = useState<ToneResult>();
  const [plan, setPlan] = useState<Plan>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [resultMode, setResultMode] = useState<Mode>();
  const run = useRef(0);

  useEffect(() => { getStatus().then((s) => setMode(s.mode)).catch(() => setMode("demo")); }, []);

  const start = useCallback(async (next: Subject, file?: Blob) => {
    const id = ++run.current; const live = () => id === run.current;
    setSubject(next); setError(undefined); setSkin(undefined); setTone(undefined); setPlan(undefined);
    try {
      setPhase("preparing");
      // The sample is sent as bytes too, so YouCam never has to fetch from our (possibly protected) domain.
      const image = mode === "live" ? await toJpegDataUrl(file ?? "/src/face-scan.jpg") : undefined;
      if (!live()) return;
      setPhase("uploading"); const t0 = performance.now();
      const pending = scan(image);
      await wait(700); if (live()) setPhase("reading");
      const r = await pending;
      const minShow = 2400 - (performance.now() - t0); if (minShow > 0) await wait(minShow); // let the scan read as a scan
      if (!live()) return;
      setResultMode(r.mode); setSkin(r.skin); setTone(r.tone); setPhase("planning");
      const p = await makePlan(r.skin, r.tone); await wait(500);
      if (!live()) return;
      setPlan(p); setPhase("done");
    } catch (e) {
      if (!live()) return;
      setError(e instanceof Error ? e.message : String(e)); setPhase("error");
    }
  }, [mode]);

  const useFile = useCallback((file: File) => {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) && file.type) { setError("Please choose a JPG or PNG photo."); setPhase("error"); return; }
    if (mode !== "live") { // never present sample numbers as a reading of someone's own face
      setNotice("Demo mode can't read your photo: there's no YouCam key on this deployment yet. Showing the sample instead.");
      start(SAMPLE); return;
    }
    setNotice(undefined);
    if (subject.kind === "user") URL.revokeObjectURL(subject.src);
    start({ kind: "user", src: URL.createObjectURL(file) }, file);
  }, [start, subject, mode]);

  return { mode, phase, subject, skin, tone, plan, error, notice, resultMode, start, useFile };
}
export type Shea = ReturnType<typeof useShea>;
