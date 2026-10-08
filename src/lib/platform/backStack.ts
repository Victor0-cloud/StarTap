// In-page steps the Android back button should undo before leaving the screen (e.g. a zoomed-in country).
// The newest handler runs first; it returns true when it handled the press.
type Handler = () => boolean;
const handlers: Handler[] = [];

export function pushBackHandler(handler: Handler): () => void {
 handlers.push(handler);
 return () => { const i = handlers.lastIndexOf(handler); if (i >= 0) handlers.splice(i, 1); };
}

export function consumeBack(): boolean {
 for (let i = handlers.length - 1; i >= 0; i--) if (handlers[i]()) return true;
 return false;
}
