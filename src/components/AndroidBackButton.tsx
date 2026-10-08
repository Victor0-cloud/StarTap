"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { decideBack } from "@/lib/platform/back";
import { consumeBack } from "@/lib/platform/backStack";

// Native Android only; the web build never registers a listener, so browser behaviour is unchanged.
export function AndroidBackButton() {
 const router = useRouter();
 useEffect(() => {
  if (Capacitor.getPlatform() !== "android") return;
  let removed = false;
  let remove: (() => void) | null = null;
  void import("@capacitor/app").then(({ App }) => App.addListener("backButton", ({ canGoBack }) => {
   if (consumeBack()) return; // e.g. zoomed into a country: back returns to the world view first
   const action = decideBack(window.location.pathname, canGoBack);
   if (action === "history-back") window.history.back();
   else if (action === "go-home") router.replace("/");
   else void App.minimizeApp();
  })).then(handle => {
   if (removed) void handle.remove(); else remove = () => void handle.remove();
  }).catch(() => { /* Without the plugin Android falls back to its default behaviour. */ });
  return () => { removed = true; remove?.(); };
 }, [router]);
 return null;
}
