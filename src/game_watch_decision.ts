export type WatchResult = {
  changed: boolean;
  diff: string;
};

export function decidePageChange(previous: string, current: string): WatchResult {
  if (previous === current) return { changed: false, diff: "" };
  return { changed: true, diff: `Previous page length: ${previous.length}\nCurrent page length: ${current.length}` };
}
