import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useBackInStock } from "@/lib/back-in-stock-store";

export function BackInStock({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const request = useBackInStock((s) => s.request);
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    request({ productId, productName, contact: contact.trim() });
    setContact("");
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-hairline bg-surface p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <Bell className="h-4 w-4" style={{ color: "var(--accent-warm)" }} />
        Сообщить, когда появится в наличии
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Пришлём письмо или SMS в течение часа после поступления.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email или телефон"
          className="h-11 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground"
          required
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background"
        >
          {done ? (
            <>
              <Check className="h-4 w-4" /> Подписаны
            </>
          ) : (
            "Уведомить"
          )}
        </button>
      </div>
    </form>
  );
}