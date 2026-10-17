import type { CapacitorConfig } from "@capacitor/cli";
const config:CapacitorConfig={
 appId:"com.startap.game",
 appName:"StarTap",
 webDir:".next-mobile",
 backgroundColor:"#081224",
 android:{backgroundColor:"#081224"},
 // Edge-to-edge (Android 15+): keep Capacitor's injected --safe-area-inset-* CSS variables (the default, stated explicitly)
 // and use light status-bar icons, since the app background is dark.
 plugins:{SystemBars:{insetsHandling:"css",style:"DARK"}},
};
export default config;

