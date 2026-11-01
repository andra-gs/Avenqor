import { Link } from "react-router";

// The link at the right of an activity heading that opens the full list.
export function ViewAllLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="rounded-control text-small font-medium text-accent outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
    >
      View all activity
    </Link>
  );
}
