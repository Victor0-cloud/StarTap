// First-run intro. Completion (finished or skipped) is stored locally; the intro can be replayed from the mascot page.
export const ONBOARDING_KEY = "startap:onboarding:v1";
export const ONBOARDING_STEPS = ["mascot", "country-city", "worlds", "powers", "rescues", "practice"] as const;
export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export const onboardingDone = (raw: string | null) => raw === "done";
