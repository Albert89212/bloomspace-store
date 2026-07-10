import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM = `Ты — доброжелательный ассистент интернет-магазина SADOVA (садовая мебель: скамейки, боковины, столы, кресла, шезлонги).
Отвечай кратко, по-русски, дружелюбно, с примерами. Помогай подобрать мебель, ответить на вопросы про
доставку (ПВЗ Ozon и Почта России), оплату (ЮKassa, СБП, карта), гарантию (2 года), возврат (7 дней по ст. 26.1 ЗоЗПП).
Если вопрос выходит за рамки магазина — вежливо перенаправь к живому оператору через раздел «Чат с продавцом».
Никогда не выдумывай наличие/цены — предложи открыть /catalog. Используй markdown при перечислениях.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system: SYSTEM,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });
          return result.toTextStreamResponse();
        } catch (e) {
          const err = e as { statusCode?: number; message?: string };
          const status = err.statusCode ?? 500;
          const msg =
            status === 402
              ? "Закончились кредиты Lovable AI. Пополните баланс в настройках."
              : status === 429
                ? "Слишком много запросов — попробуйте ещё раз через минуту."
                : (err.message ?? "Ошибка ассистента");
          return new Response(msg, { status });
        }
      },
    },
  },
});