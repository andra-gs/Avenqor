import type { ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "../../lib/classNames";

interface ListRowProps {
  title: string;
  // When given, the title is a link to this address.
  titleTo?: string;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  // A tinted row has a light background. Rows without it sit directly on their card.
  tinted?: boolean;
}

// One row of a list: an optional leading element, a title with a subtitle, and an optional trailing element.
export function ListRow({ title, titleTo, subtitle, leading, trailing, tinted = true }: ListRowProps) {
  return (
    <div className={cx("flex items-center gap-3", tinted && "rounded-control bg-surface-muted px-3.5 py-2.5")}>
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-small font-semibold">
          {titleTo ? (
            <Link to={titleTo} className="rounded-control outline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
              {title}
            </Link>
          ) : (
            title
          )}
        </p>
        {subtitle && <div className="text-caption text-ink-muted">{subtitle}</div>}
      </div>
      {trailing}
    </div>
  );
}
