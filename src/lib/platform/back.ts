export type BackAction = "history-back" | "go-home" | "minimize";

// Android back button. Nested screens return to the previous StarTap screen; opened directly into a game,
// back goes home. On home the app is sent to the background (not destroyed), so saved games and sound
// settings are untouched and reopening resumes where the player left off.
export function decideBack(pathname: string, canGoBack: boolean): BackAction {
 const path = pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
 if (path === "/") return "minimize";
 return canGoBack ? "history-back" : "go-home";
}
