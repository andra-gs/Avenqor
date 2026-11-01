import { useEffect, useState } from "react";
import { describeError } from "../lib/errors";
import { getActivityLog } from "../services/activityService";
import type { ActivityEntry, ActivityScope } from "../types/activity";

const PAGE_SIZE = 50;

// The full history of one scope, newest first, 50 entries at a time. `showMore` reads 50 more.
export function useActivityLog(scope: ActivityScope) {
  const scopeKey = scope.kind === "all" ? "all" : `${scope.kind}:${scope.id}`;
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [entries, setEntries] = useState<ActivityEntry[]>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string>();

  // A different scope starts again from the first page.
  useEffect(() => {
    setLimit(PAGE_SIZE);
    setEntries(undefined);
  }, [scopeKey]);

  useEffect(() => {
    let current = true;
    getActivityLog(scope, limit)
      .then((result) => {
        if (!current) return;
        setEntries(result.entries);
        setHasMore(result.hasMore);
        setError(undefined);
      })
      .catch((failure: unknown) => {
        if (current) setError(describeError(failure));
      });
    return () => {
      current = false;
    };
    // `scope` is an object made on every render; its content is in scopeKey, so only that is watched.
  }, [scopeKey, limit]);

  return { entries, hasMore, error, showMore: () => setLimit((value) => value + PAGE_SIZE) };
}
