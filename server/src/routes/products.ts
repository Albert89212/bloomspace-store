import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(typeof category === "string" ? { category: { slug: category } } : {}),
        ...(typeof q === "string" && q ? { name: { contains: q } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    res.json(products);
  } catch (e) {
    next(e);
  }
});

productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, reviews: { where: { approved: true } } },
    });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (e) {
    next(e);
  }
});

const productSchema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  description: z.string().max(5000),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string(),
  images: z.array(z.string().url()).default([]),
  specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
});

productsRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const p = await prisma.product.create({ data });
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
});

productsRouter.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const p = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(p);
  } catch (e) {
    next(e);
  }
});

productsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});