import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Truck, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/products";

// Приблизительный расчёт по первым цифрам индекса РФ.
// В проде — подмена вызовами API Озон и Почты России.
function estimate(zip: string, weightKg: number) {
  const z = zip.trim().slice(0, 3);
  const region = parseInt(z || "0", 10);
  let baseOzon = 490;
  let daysOzon = "2–4";
  if (region >= 100 && region <= 199) { baseOzon = 290; daysOzon = "1–2"; }
  else if (region >= 600 && region <= 659) { baseOzon = 690; daysOzon = "3–6"; }
  else if (region >= 660 && region <= 679) { baseOzon = 890; daysOzon = "5–8"; }
  else if (region >= 680) { baseOzon = 1190; daysOzon = "7–10"; }
  const w = Math.max(1, weightKg);
  return { ozon: Math.round(baseOzon + (w - 1) * 90), daysOzon };
}

export function DeliveryCalc({ weightKg = 8 }: { weightKg?: number }) {
  const [zip, setZip] = useState("");
  const result = useMemo(() => (zip.length >= 3 ? estimate(zip, weightKg) : null), [zip, weightKg]);

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <Truck className="h-4 w-4" style={{ color: "var(--brand)" }} />
        Расчёт доставки
      </div>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-[12px] text-muted-foreground">Индекс получателя</span>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            inputMode="numeric"
            maxLength={6}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            placeholder="Например, 101000"
            className="h-11 w-full rounded-full border border-hairline bg-background pl-9 pr-4 text-[14px] outline-none focus:border-foreground"
          />
        </div>
      </label>

      {result ? (
        <motion.ul
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2 text-[13px]"
        >
          <li className="flex items-center justify-between rounded-2xl bg-background p-3">
            <div>
              <div className="font-medium">ПВЗ Ozon</div>
              <div className="text-[12px] text-muted-foreground">{result.daysOzon} раб. дн.</div>
            </div>
            <div className="font-semibold">{formatPrice(result.ozon)}</div>
          </li>
        </motion.ul>
      ) : (
        <p className="mt-4 text-[12px] text-muted-foreground">
          Введите индекс — покажем цену и срок доставки до ближайшего ПВЗ Ozon. Курьером не возим.
        </p>
      )}
    </div>
  );
}