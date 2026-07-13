import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchCollection = createServerFn({ method: "GET" })
  .validator((data) => z.object({ name: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const allowed = new Set([
      "products",
      "news",
      "announcements",
      "orders",
      "reviews",
      "support-threads",
      "staff-chat",
      "promocodes",
      "tickets",
      "life-posts",
      "back-in-stock",
      "staff",
      "role-labels",
      "cms",
    ]);
    if (!allowed.has(data.name)) return [] as any[];
    try {
      const { readCollection } = await import("./shared-collection.server");
      return await readCollection<any>(data.name);
    } catch {
      return null;
    }
  });

export const saveCollection = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ name: z.string(), items: z.array(z.any()) }).parse(data),
  )
  .handler(async ({ data }) => {
    const allowed = new Set([
      "products",
      "news",
      "announcements",
      "orders",
      "reviews",
      "support-threads",
      "staff-chat",
      "promocodes",
      "tickets",
      "life-posts",
      "back-in-stock",
      "staff",
      "role-labels",
      "cms",
    ]);
    if (!allowed.has(data.name)) throw new Error("Unknown collection");
    try {
      const { writeCollection } = await import("./shared-collection.server");
      await writeCollection(data.name, data.items);
      return { ok: true, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  });