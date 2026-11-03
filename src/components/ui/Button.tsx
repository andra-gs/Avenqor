import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/classNames";
import { Icon, type IconName } from "../icons/Icon";

type ButtonVariant = "primary" | "secondary" | "danger";

// className is not accepted on purpose: the look of a button lives here and in the tokens.
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  icon?: IconName;
  // On a phone (below 768 px) only the icon is shown and the label becomes the accessible name. Needs `icon`.
  iconOnlyOnPhone?: boolean;
}

const BASE =
  "inline-flex h-9 items-center justify-center gap-2 rounded-control px-4 text-body font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:opacity-90",
  secondary: "border border-border bg-surface text-ink hover:bg-surface-muted",
  danger: "bg-danger text-on-accent hover:opacity-90",
};

export function Button({ variant = "primary", icon, iconOnlyOnPhone = false, type = "button", children, ...rest }: ButtonProps) {
  // The text of a button that shows only its icon on a phone (it stays the accessible name and the tooltip).
  const phoneLabel = iconOnlyOnPhone && icon !== undefined && typeof children === "string" ? children : undefined;
  return (
    <button
      type={type}
      className={cx(BASE, VARIANTS[variant], phoneLabel && "max-md:w-9 max-md:px-0")}
      aria-label={phoneLabel}
      title={phoneLabel}
      {...rest}
    >
      {icon && <Icon name={icon} className="size-4 shrink-0" />}
      {phoneLabel ? <span className="max-md:hidden">{children}</span> : children}
    </button>
  );
}
