import markUrl from "../../assets/avenqor-mark.png";
import wordmarkUrl from "../../assets/avenqor-logo.png";
import { APP_NAME } from "../../lib/appInfo";

interface BrandLogoProps {
  // "wordmark" is the full name in the logo lettering; "mark" is only the letter A.
  variant: "wordmark" | "mark";
}

// The Avenqor logo. Images live in src/assets; size is fixed here so every screen shows it the same way.
export function BrandLogo({ variant }: BrandLogoProps) {
  if (variant === "mark") {
    // Decorative: the name is written next to it.
    return <img src={markUrl} alt="" aria-hidden="true" draggable={false} className="h-4 w-auto shrink-0" />;
  }
  return <img src={wordmarkUrl} alt={APP_NAME} draggable={false} className="h-7 w-auto max-w-full" />;
}
