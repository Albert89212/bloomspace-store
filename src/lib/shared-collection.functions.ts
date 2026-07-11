import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED = new Set(["products", "news", "announcements"]);

export const fetchCollection = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ name: z.string() }).parse(data))
  .handler(async ({ data }) => {
    if (!ALLOWED.has(data.name)) return [] as unknown[];
    const { readCollection } = await import("./shared-collection.server");
    return readCollection(data.name);
  });

export const saveCollection = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ name: z.string(), items: z.array(z.any()) }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!ALLOWED.has(data.name)) throw new Error("Unknown collection");
    const { writeCollection } = await import("./shared-collection.server");
    writeCollection(data.name, data.items);
    return { ok: true };
  });