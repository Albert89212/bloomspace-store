import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import {
  WAREHOUSE,
  calcOzonPrice,
  findCityCenter,
  generatePvzAround,
  haversineKm,
  type PvzPoint,
} from "@/lib/ozon-pvz";
import { formatPrice } from "@/lib/products";

// Загрузчик API Яндекс.Карт с ленивым синглтоном.
let ymapsPromise: Promise<any> | null = null;
function loadYmaps(apiKey?: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  const w = window as any;
  if (w.ymaps && w.ymaps.ready) {
    return new Promise((r) => w.ymaps.ready(() => r(w.ymaps)));
  }
  if (!ymapsPromise) {
    ymapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const key = apiKey ? `&apikey=${apiKey}` : "";
      script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${key}`;
      script.async = true;
      script.onload = () => w.ymaps.ready(() => resolve(w.ymaps));
      script.onerror = () => reject(new Error("Не удалось загрузить Яндекс.Карты"));
      document.head.appendChild(script);
    });
  }
  return ymapsPromise;
}

export interface PvzSelection {
  point: PvzPoint;
  distanceKm: number;
  price: number;
}

interface Props {
  city: string;
  onCityChange: (v: string) => void;
  onSelect: (sel: PvzSelection | null) => void;
  selectedId?: string | null;
}

export function YandexPvzMap({ city, onCityChange, onSelect, selectedId }: Props) {
  const apiKey = (import.meta as any).env?.VITE_YANDEX_MAPS_KEY as string | undefined;
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pvzList, setPvzList] = useState<PvzPoint[]>([]);

  const center = useMemo(() => findCityCenter(city), [city]);

  // Инициализация карты — один раз.
  useEffect(() => {
    let disposed = false;
    loadYmaps(apiKey)
      .then((ymaps) => {
        if (disposed || !mapEl.current) return;
        const c = center ?? { lat: WAREHOUSE.lat, lon: WAREHOUSE.lon };
        mapRef.current = new ymaps.Map(mapEl.current, {
          center: [c.lat, c.lon],
          zoom: 11,
          controls: ["zoomControl", "geolocationControl"],
        });
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.message ?? "Ошибка загрузки карты");
        setLoading(false);
      });
    return () => {
      disposed = true;
      try {
        mapRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Обновление ПВЗ при смене города.
  useEffect(() => {
    if (!center) {
      setPvzList([]);
      onSelect(null);
      return;
    }
    const list = generatePvzAround(center.city, center.lat, center.lon);
    setPvzList(list);
  }, [center, onSelect]);

  // Рисуем метки на карте.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    const w = window as any;
    if (!w.ymaps) return;
    map.geoObjects.removeAll();
    map.setCenter([center.lat, center.lon], 11, { duration: 300 });

    // склад
    const warehouse = new w.ymaps.Placemark(
      [WAREHOUSE.lat, WAREHOUSE.lon],
      { hintContent: WAREHOUSE.label, balloonContent: WAREHOUSE.label },
      { preset: "islands#blueFactoryIcon" },
    );
    map.geoObjects.add(warehouse);

    pvzList.forEach((p) => {
      const isSel = p.id === selectedId;
      const placemark = new w.ymaps.Placemark(
        [p.lat, p.lon],
        {
          hintContent: p.name,
          balloonContent: `<b>${p.name}</b><br>${p.address}<br>Часы: ${p.hours}`,
        },
        {
          preset: isSel ? "islands#redDeliveryIcon" : "islands#blueDeliveryIcon",
          iconColor: isSel ? "#e60000" : "#005bff",
        },
      );
      placemark.events.add("click", () => {
        const km = haversineKm({ lat: WAREHOUSE.lat, lon: WAREHOUSE.lon }, p);
        onSelect({ point: p, distanceKm: km, price: calcOzonPrice(km) });
      });
      map.geoObjects.add(placemark);
    });
  }, [pvzList, center, selectedId, onSelect]);

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
          <Search className="h-3.5 w-3.5" /> Город
        </span>
        <input
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Москва, Санкт-Петербург, Казань…"
          className="h-11 w-full rounded-2xl border border-hairline bg-background px-4 text-[14px] outline-none focus:border-foreground"
        />
        {city.trim() && !center && (
          <span className="mt-1 block text-[11px] text-amber-600">
            Город не найден в базе. Попробуйте: Москва, СПб, Казань, Екатеринбург, Астрахань.
          </span>
        )}
      </label>

      <div className="overflow-hidden rounded-2xl border border-hairline">
        <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> ПВЗ Ozon · выберите точку на карте
          </span>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        </div>
        <div ref={mapEl} className="h-72 w-full bg-secondary" />
        {error && (
          <div className="border-t border-hairline bg-red-50 px-4 py-2 text-[12px] text-red-700">
            {error}. Добавьте VITE_YANDEX_MAPS_KEY в .env
          </div>
        )}
      </div>

      {pvzList.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {pvzList.map((p) => {
            const km = haversineKm({ lat: WAREHOUSE.lat, lon: WAREHOUSE.lon }, p);
            const price = calcOzonPrice(km);
            const isSel = p.id === selectedId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ point: p, distanceKm: km, price })}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                    isSel ? "border-foreground bg-secondary" : "border-hairline hover:border-muted-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-medium">{p.name}</div>
                    <div className="text-[12px] font-semibold tabular-nums">{formatPrice(price)}</div>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{p.address}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {p.hours} · ~{km.toFixed(0)} км от склада
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}