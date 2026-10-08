"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { MASCOTS } from "@/lib/game/mascots";
import { ONBOARDING_KEY, onboardingDone } from "@/lib/game/onboarding";
import { MascotImage } from "./MascotImage";
import { useMascot } from "./useMascot";
import { IS_ANDROID_BUILD } from "@/lib/site";

const subscribe = () => () => {};
const done = () => { try { return onboardingDone(localStorage.getItem(ONBOARDING_KEY)); } catch { return true; } };

/**
 * Home: shows the chosen mascot with a link to change it. In the Android app it also sends first-time players to the
 * intro; on the public website the home page is the landing page, so visitors are never redirected away from it.
 */
export function HomeMascot() {
 const router = useRouter();
 const mounted = useSyncExternalStore(subscribe, () => true, () => false);
 const [mascot] = useMascot();
 useEffect(() => { if (IS_ANDROID_BUILD && mounted && !done()) router.replace("/welcome/"); }, [mounted, router]);
 if (!mounted) return null;
 const m = MASCOTS[mascot];
 return <Link className="home-mascot" href="/mascot/" aria-label={`Your mascot: ${m.name}. Change mascot`}>
  <MascotImage id={mascot} size={40} /><span><small>YOUR MASCOT</small><strong>{m.name}</strong></span><span className="home-mascot-change">CHANGE</span>
 </Link>;
}
