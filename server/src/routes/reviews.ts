import { Router } from "express";
import xss from "xss";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

export const reviewsRouter = Router();

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
});

reviewsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = reviewSchema.parse(req.body);
    const review = await prisma.review.create({
      data: {
        userId: (req as any).userId,
        productId: data.productId,
        rating: data.rating,
        text: xss(data.text),
      },
    });
    res.status(201).json(review);
  } catch (e) {
    next(e);
  }
});

reviewsRouter.get("/product/:productId", async (req, res, next) => {
  try {
    const list = await prisma.review.findMany({
      where: { productId: req.params.productId, approved: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});