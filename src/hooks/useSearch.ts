import { useEffect, useState } from "react";
import { describeError } from "../lib/errors";
import { cleanSearchText, search } from "../services/searchService";
import { EMPTY_SEARCH_RESULTS, type SearchResults } from "../types/search";

const DELAY_MS = 200;

// Searches while the person types, a moment after the last key. An answer that arrives after the text
// has changed again is thrown away.
export function useSearch(input: string) {
  const [results, setResults] = useState<SearchResults>(EMPTY_SEARCH_RESULTS);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string>();
  const text = cleanSearchText(input);

  useEffect(() => {
    if (!text) {
      setResults(EMPTY_SEARCH_RESULTS);
      setSearching(false);
      setError(undefined);
      return;
    }
    let current = true;
    setSearching(true);
    const timer = window.setTimeout(() => {
      search(text)
        .then((found) => {
          if (!current) return;
          setResults(found);
          setError(undefined);
        })
        .catch((failure: unknown) => {
          if (current) setError(describeError(failure));
        })
        .finally(() => {
          if (current) setSearching(false);
        });
    }, DELAY_MS);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [text]);

  return { results, searching, error, tooShort: input.trim().length > 0 && !text };
}
