"use client";
import Image from "next/image";
import { useState } from "react";

export function StarPortrait({ name, monogram, imageUrl }: { name: string; monogram: string; imageUrl?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="star-portrait">
    {imageUrl && !failed
      ? <Image src={imageUrl} alt={name} width={120} height={120} unoptimized onError={() => setFailed(true)} />
      : <span role="img" aria-label={name + " initials"}>{monogram}</span>}
  </div>;
}
