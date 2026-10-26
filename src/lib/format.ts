export const ghs = (n: number) => `GH₵ ${n.toLocaleString("en-GH")}`;
export const band = (score: number) => (score >= 76 ? "good" : score >= 66 ? "watch" : "focus");
export const bandColour = { good: "var(--color-leaf)", watch: "var(--color-ochre)", focus: "var(--color-clay)" } as const;
export const STEP_LABEL: Record<string, string> = { cleanse: "Cleanse", treat: "Treat", eye: "Eyes", moisturise: "Moisturise", protect: "Protect" };
