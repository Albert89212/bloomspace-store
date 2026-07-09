import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useSupportChat } from "@/lib/support-chat-store";
import { useCurrentUser } from "@/lib/auth-store";

export function SupportChatWidget() {
  const open = useSupportChat((s) => s.open);
  const toggle = useSupportChat((s) => s.toggle);
  const setOpen = useSupportChat((s) => s.setOpen);
  const messages = useSupportChat((s) => s.messages);
  const send = useSupportChat((s) => s.send);
  const user = useCurrentUser();
  const [text, setText] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bodyRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [open, messages.length]);

  return (
    <>
      <motion.button
        onClick={toggle}
        aria-label="Открыть чат поддержки"
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-40 flex h-13 items-center gap-2 rounded-full bg-foreground px-4 py-3 text-background shadow-lg shadow-black/20"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden text-[13px] font-medium sm:inline">Поддержка</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-40 flex h-[520px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-hairline bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-3">
              <div>
                <div className="text-[13px] font-medium">SADOVA · Поддержка</div>
                <div className="text-[11px] text-muted-foreground">
                  Онлайн · среднее время ответа 3 мин
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-background"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={bodyRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] ${
                    m.author === "user"
                      ? "ml-auto bg-foreground text-background"
                      : "bg-surface"
                  }`}
                >
                  <div className="text-[10px] opacity-70">{m.authorName}</div>
                  <div className="mt-0.5 whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(text, user?.name ?? "Гость");
                setText("");
              }}
              className="flex items-center gap-2 border-t border-hairline p-3"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Напишите сообщение…"
                className="flex-1 rounded-full border border-hairline bg-background px-4 py-2 text-[13px] outline-none focus:border-foreground"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background"
                aria-label="Отправить"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}