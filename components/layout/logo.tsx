import Image from "next/image";
import { SITE } from "@/lib/site-config";

/**
 * The shop's logo lockup: the illustration mark plus the wordmark set in the
 * display face.
 *
 * `logo-mark.png` is the shop's own logo with its baked-in "MiTea" lettering
 * cropped away. That lettering is illegible at header size, and leaving it in
 * would print the name twice — once as unreadable pixels, once as live text.
 * Cropping keeps the artwork and lets the wordmark be real, selectable,
 * theme-coloured type.
 *
 * The mark is decorative here (`alt=""`) because the adjacent text already
 * names the shop; the full artwork, wordmark included, is at
 * `/images/logo.png` for places that want it whole.
 */
export function Logo({
  showWordmark = true,
  className = "",
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/logo-mark.png"
        alt={showWordmark ? "" : SITE.name}
        width={512}
        height={383}
        priority
        className="h-9 w-auto sm:h-10"
      />
      {showWordmark ? (
        <span className="font-display text-2xl leading-none font-bold">
          {SITE.name}
        </span>
      ) : null}
    </span>
  );
}
