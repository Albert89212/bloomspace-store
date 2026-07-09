import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
  delivery: z.object({
    kind: z.enum(["PVZ", "COURIER", "POST"]),
    carrier: z.string().optional(),
    pvzCode: z.string().optional(),
    addressId: z.string().optional(),
  }),
  promoCode: z.string().optional(),
  offerAccepted: z.literal(true),
  privacyAccepted: z.literal(true),
});

ordersRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const data = createOrderSchema.parse(req.body);

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    if (products.length !== productIds.length)
      return res.status(400).json({ error: "Invalid products" });

    const subtotal = data.items.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.productId)!;
      return sum + p.price * i.quantity;
    }, 0);
    const deliveryPrice = 0; // TODO: рассчитать через CDEK / Boxberry API

    const agreement = await prisma.agreement.create({
      data: {
        userId,
        offerAccepted: data.offerAccepted,
        privacyAccepted: data.privacyAccepted,
        ip: req.ip ?? "",
        userAgent: req.headers["user-agent"] ?? "",
      },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        subtotal,
        deliveryPrice,
        total: subtotal + deliveryPrice,
        deliveryKind: data.delivery.kind,
        deliveryCarrier: data.delivery.carrier,
        pvzCode: data.delivery.pvzCode,
        addressId: data.delivery.addressId,
        agreementId: agreement.id,
        items: {
          create: data.items.map((i) => {
            const p = products.find((x) => x.id === i.productId)!;
            return { productId: p.id, name: p.name, price: p.price, quantity: i.quantity };
          }),
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

ordersRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});