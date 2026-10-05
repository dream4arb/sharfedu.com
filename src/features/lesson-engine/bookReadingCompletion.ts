/** Reaching the end alone must not award completion for pages skipped in between. */
export function isBookReadingComplete(requiredPages: readonly number[], viewedPages: ReadonlySet<number>, reachedEnd: boolean): boolean {
  return reachedEnd && requiredPages.length > 0 && requiredPages.every((page) => viewedPages.has(page));
}
