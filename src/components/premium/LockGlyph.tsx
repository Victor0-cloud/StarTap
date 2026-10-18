/** Small padlock drawn in the current text colour. Decorative: the PREMIUM text beside it carries the meaning. */
export function LockGlyph({ size = 11 }: { size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="currentColor" style={{ flex: "none" }}>
    <path d="M8 1.5a3.5 3.5 0 0 0-3.5 3.5v2H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12 7h-.5V5A3.5 3.5 0 0 0 8 1.5Zm-2 3.5a2 2 0 1 1 4 0v2H6V5Z" />
  </svg>;
}
