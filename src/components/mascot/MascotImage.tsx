import Image from "next/image";
import { mascotCard, mascotPortal, mascotToken, type MascotId } from "@/lib/game/mascots";

/** The project's own mascot artwork (public/mascots), as a round token or a portrait card. Decorative unless `alt` is given. */
export function MascotImage({ id, kind = "token", size, className, alt = "", ...rest }: { id: MascotId; kind?: "token" | "card" | "portal"; size: number; className?: string; alt?: string } & Record<`data-${string}`, string | undefined>) {
 return <Image src={kind === "card" ? mascotCard(id) : kind === "portal" ? mascotPortal(id) : mascotToken(id)} alt={alt} width={size} height={size} className={className} unoptimized draggable={false} {...rest} />;
}
