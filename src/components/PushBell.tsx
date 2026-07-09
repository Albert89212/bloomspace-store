import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/lib/notifications-store";

export function PushBell() {
  const items = useNotifications((s) => s.items);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread) setTimeout(markAllRead, 400);
        }}
        aria-label="Уведомления"
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-hairline bg-background shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <div className="text-[13px] font-medium">Уведомления</div>
                <div className="text-[11px] text-muted-foreground">{items.length}</div>
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-muted-foreground">
                  Пока пусто.
                </div>
              ) : (
                <ul className="max-h-96 divide-y divide-hairline overflow-y-auto">
                  {items.map((n) => (
                    <li key={n.id} className="px-4 py-3">
                      <div className="text-[12px] font-medium">{n.title}</div>
                      <div className="mt-0.5 text-[12px] text-muted-foreground">
                        {n.body}
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString("ru-RU")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}