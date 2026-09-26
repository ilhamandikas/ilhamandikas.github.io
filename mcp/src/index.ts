// ilham-mcp — a discovery-only MCP server for the tools on https://ilham.dev.
//
// It exposes exactly three tools: list_tools, search_tools and get_tool. There
// is deliberately no execution tool: the site's tools run in the browser, and a
// server that could run commands on your behalf would be a different, much more
// dangerous product.
//
// The whole thing is stateless. Every request reads the cached registry, so a
// cold isolate answers in one fetch and there is nothing to migrate.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { brief, byCategory, loadRegistry, search } from "./registry.js";

interface Env {
  // Optional override so the Worker can be pointed at a staging or local copy
  // of the registry. Defaults to the live site (see registry.ts).
  REGISTRY_URL?: string;
}

function buildServer(registryUrl?: string): McpServer {
  const server = new McpServer({ name: "ilham.dev tools", version: "1.0.0" });

  server.registerTool(
    "list_tools",
    {
      title: "List tools",
      description: "List every tool on ilham.dev, or only the ones in one category.",
      inputSchema: {
        category: z.string().optional().describe("Category slug or name, e.g. 'devops' or 'DevOps'."),
      },
    },
    async ({ category }) => {
      const registry = await loadRegistry(registryUrl);
      const tools = category ? byCategory(registry, category) : registry.tools;
      return {
        content: [{ type: "text", text: JSON.stringify(tools.map(brief), null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_tools",
    {
      title: "Search tools",
      description: "Find tools that match a plain-language need, e.g. 'check which process uses a port'.",
      inputSchema: {
        query: z.string().describe("What the user wants to do."),
        limit: z.number().int().min(1).max(25).optional().describe("Maximum results (default 8)."),
      },
    },
    async ({ query, limit }) => {
      const registry = await loadRegistry(registryUrl);
      const results = search(registry, query, limit ?? 8);
      return {
        content: [{ type: "text", text: results.length ? JSON.stringify(results, null, 2) : "No matching tools." }],
      };
    },
  );

  server.registerTool(
    "get_tool",
    {
      title: "Get one tool",
      description: "Get the full record for one tool: documentation URL, keywords, use cases and example questions.",
      inputSchema: {
        id: z.string().describe("Tool id, e.g. 'linux-ops'."),
      },
    },
    async ({ id }) => {
      const registry = await loadRegistry(registryUrl);
      const tool = registry.tools.find((t) => t.id === id);
      if (!tool) {
        return { content: [{ type: "text", text: `No tool with id '${id}'.` }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify(tool, null, 2) }] };
    },
  );

  return server;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
  });

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const registryUrl = env.REGISTRY_URL;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "content-type, mcp-session-id, mcp-protocol-version, authorization",
        },
      });
    }

    if (url.pathname === "/mcp") {
      // Stateless: a fresh server and transport per request. `enableJsonResponse`
      // keeps replies as plain JSON instead of an SSE stream, which makes the
      // endpoint trivial to poke with curl.
      const server = buildServer(registryUrl);
      const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      await server.connect(transport);
      return transport.handleRequest(request);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      const registry = await loadRegistry(registryUrl);
      return json({
        ok: true,
        service: "ilham-mcp",
        registry: registry.url,
        tools: registry.count,
        mcp: `${url.origin}/mcp`,
        rest: [`${url.origin}/api/tools`, `${url.origin}/api/search?q=`, `${url.origin}/api/tool/:id`],
      });
    }

    if (url.pathname === "/api/tools") {
      const registry = await loadRegistry(registryUrl);
      const category = url.searchParams.get("category");
      const tools = category ? byCategory(registry, category) : registry.tools;
      return json({ count: tools.length, tools: tools.map(brief) });
    }

    if (url.pathname === "/api/search") {
      const registry = await loadRegistry(registryUrl);
      const limit = Number(url.searchParams.get("limit") ?? 8);
      return json({ results: search(registry, url.searchParams.get("q") ?? "", Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 25) : 8) });
    }

    if (url.pathname.startsWith("/api/tool/")) {
      const registry = await loadRegistry(registryUrl);
      const id = decodeURIComponent(url.pathname.slice("/api/tool/".length));
      const tool = registry.tools.find((t) => t.id === id);
      return tool ? json(tool) : json({ error: `no tool with id '${id}'` }, 404);
    }

    return json({ error: "not found", endpoints: ["/mcp", "/api/tools", "/api/search?q=", "/api/tool/:id"] }, 404);
  },
} satisfies ExportedHandler<Env>;
