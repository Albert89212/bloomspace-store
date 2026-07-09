import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

export const paymentsRouter = Router();

/**
 * Создание платежа в ЮKassa.
 * Договор считается заключённым в момент, когда webhook сообщает payment.succeeded.
 */
paymentsRouter.post("/yookassa/create", requireAuth, async (req, res, next) => {
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== (req as any).userId)
      return res.status(404).json({ error: "Order not found" });

    const idempotencyKey = crypto.randomUUID();
    const shopId = process.env.YOOKASSA_SHOP_ID!;
    const secret = process.env.YOOKASSA_SECRET_KEY!;

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotencyKey,
        Authorization: "Basic " + Buffer.from(`${shopId}:${secret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: { value: (order.total / 100).toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `${process.env.APP_URL ?? "https://sadova.example"}/orders/${order.id}`,
        },
        metadata: { orderId: order.id },
        description: `Заказ ${order.id.slice(0, 8)}`,
      }),
    });

    if (!response.ok) throw new Error(`YooKassa ${response.status}`);
    const payment = (await response.json()) as {
      id: string;
      confirmation: { confirmation_url: string };
    };

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProvider: "YOOKASSA", paymentId: payment.id },
    });

    res.json({ url: payment.confirmation.confirmation_url });
  } catch (e) {
    next(e);
  }
});

/**
 * Webhook ЮKassa: помечает заказ оплаченным.
 * Требует включённой в кабинете подписи + IP-белого списка ЮKassa.
 */
paymentsRouter.post("/yookassa/webhook", async (req, res, next) => {
  try {
    const event = req.body as {
      event: string;
      object: { id: string; status: string; metadata?: { orderId?: string } };
    };
    if (event.event === "payment.succeeded" && event.object.metadata?.orderId) {
      await prisma.order.update({
        where: { id: event.object.metadata.orderId },
        data: { status: "PAID", paidAt: new Date() },
      });
    }
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});