// Reads the public tool registry and keeps it warm.
//
// The registry at https://ilham.dev/tools/tools.json is the single source of
// truth: it is generated from the site's own data at build time, so this Worker
// never needs a database and can never disagree with the site. Two caches keep
// the fetch rare: a module-level value for the lifetime of the isolate, and the
// Cache API for every other isolate in the same colo.

export interface Tool {
  id: string;
  name: string;
  url: string;
  documentation: string;
  category: string;
  category_name: string;
  description: string;
  keywords: string[];
  use_cases?: string[];
  examples?: string[];
  features: string[];
  status: string;
}

export interface Registry {
  name: string;
  description: string;
  url: string;
  count: number;
  tools: Tool[];
}

/** The fields a model actually needs; the long prose stays in the Markdown twin. */
export interface Brief {
  id: string;
  name: string;
  url: string;
  documentation: string;
  category: string;
  description: string;
  keywords: string[];
  use_cases: string[];
  examples: string[];
}

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.map((item) => String(item)) : []);

const DEFAULT_REGISTRY_URL = "https://ilham.dev/tools/tools.json";
const TTL_SECONDS = 60 * 60;

let memory: { at: number; url: string; registry: Registry } | null = null;

export async function loadRegistry(url: string = DEFAULT_REGISTRY_URL): Promise<Registry> {
  const now = Date.now();
  if (memory && memory.url === url && now - memory.at < TTL_SECONDS * 1000) return memory.registry;

  const cacheKey = new Request(url);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    const fetched = await fetch(url, { cf: { cacheTtl: TTL_SECONDS, cacheEverything: true } });
    if (!fetched.ok) throw new Error(`${url} returned ${fetched.status}`);
    const body = await fetched.text();
    response = new Response(body, {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${TTL_SECONDS}` },
    });
    await cache.put(cacheKey, response.clone());
  }

  const registry = (await response.json()) as Registry;
  // The registry is generated, but a stray number in a YAML keyword list would
  // still reach us as a number; keep every downstream string operation safe.
  for (const tool of registry.tools) {
    tool.name = String(tool.name);
    tool.description = String(tool.description);
    tool.keywords = strings(tool.keywords);
    tool.use_cases = strings(tool.use_cases);
    tool.examples = strings(tool.examples);
    tool.features = strings(tool.features);
  }
  memory = { at: now, url, registry };
  return registry;
}

export function brief(tool: Tool): Brief {
  return {
    id: tool.id,
    name: tool.name,
    url: tool.url,
    documentation: tool.documentation,
    category: tool.category_name,
    description: tool.description,
    keywords: tool.keywords ?? [],
    use_cases: tool.use_cases ?? [],
    examples: tool.examples ?? [],
  };
}

export function byCategory(registry: Registry, category: string): Tool[] {
  const needle = category.trim().toLowerCase();
  return registry.tools.filter((t) => t.category.toLowerCase() === needle || t.category_name.toLowerCase() === needle);
}

/**
 * Deliberately small keyword scorer: the catalog is only ~140 items, so a
 * transparent match beats a dependency. Name and keyword hits weigh more than a
 * hit anywhere in the description.
 */
export function search(registry: Registry, query: string, limit: number): Brief[] {
  const terms = query.toLowerCase().split(/[^a-z0-9+#.]+/).filter((t) => t.length > 1);
  if (terms.length === 0) return registry.tools.slice(0, limit).map(brief);

  return registry.tools
    .map((tool) => {
      const name = tool.name.toLowerCase();
      const keywords = (tool.keywords ?? []).map((k) => k.toLowerCase());
      const haystack = [name, tool.description, tool.category_name, ...keywords, ...(tool.use_cases ?? []), ...(tool.examples ?? [])]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
        if (name.includes(term)) score += 2;
        if (keywords.includes(term)) score += 3;
      }
      return { tool, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => brief(hit.tool));
}
