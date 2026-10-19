const MAX_PAGES = 50; // safety net: 5,000 rows

/**
 * Notion returns at most 100 rows per query. Follow `next_cursor` until `has_more`
 * is false so that every row of a database is loaded.
 */
export async function queryAll(
  databaseId: string,
  token: string,
  body: Record<string, unknown> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        ...body,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    rows.push(...data.results);
    if (!data.has_more || !data.next_cursor) return rows;
    cursor = data.next_cursor;
  }

  console.warn(`queryAll: stopped after ${MAX_PAGES} pages (${rows.length} rows)`);
  return rows;
}
