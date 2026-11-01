import { useEffect, useState } from "react";
import { watchMaximized } from "../lib/windowControls";

// Whether the window is maximized, so the title bar can show the right button.
export function useWindowMaximized(): boolean {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    watchMaximized((value) => {
      if (!cancelled) setMaximized(value);
    })
      .then((unlisten) => {
        if (cancelled) unlisten();
        else stop = unlisten;
      })
      .catch(() => {
        // Not running inside the desktop window (for example a plain browser): keep the default.
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return maximized;
}
