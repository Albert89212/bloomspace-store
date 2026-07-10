import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Провайдер для Lovable AI Gateway.
// Ключ читаем в момент использования — только на сервере.
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}