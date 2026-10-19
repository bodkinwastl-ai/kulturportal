/**
 * Events reference their source through a Notion relation, which only yields the
 * source's page id. Resolve it to the readable name; unknown ids stay empty.
 */
export function resolveSourceNames<E extends { sourceId?: string; sourceName?: string }>(
  events: E[],
  sources: { id: string; name: string }[]
): E[] {
  const names = new Map(sources.map((s) => [s.id, s.name]));
  return events.map((e) => (e.sourceId ? { ...e, sourceName: names.get(e.sourceId) ?? e.sourceName ?? "" } : e));
}
