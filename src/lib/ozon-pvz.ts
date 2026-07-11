// Мок-данные ПВЗ Ozon вокруг крупных городов РФ + утилиты расчёта стоимости.
// В проде — заменяется вызовом Ozon Rocket API `/v1/pickup-points/list`.

export interface PvzPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lon: number;
  hours: string;
}

// Центральный склад SADOVA — Москва, Каширское шоссе.
export const WAREHOUSE: { lat: number; lon: number; label: string } = {
  lat: 55.6353,
  lon: 37.6913,
  label: "Склад SADOVA · Москва",
};

// Крупные города с координатами центра.
const CITY_CENTERS: Record<string, { lat: number; lon: number }> = {
  Москва: { lat: 55.7558, lon: 37.6173 },
  "Санкт-Петербург": { lat: 59.9343, lon: 30.3351 },
  Казань: { lat: 55.7963, lon: 49.1064 },
  Екатеринбург: { lat: 56.8389, lon: 60.6057 },
  Новосибирск: { lat: 55.0084, lon: 82.9357 },
  Краснодар: { lat: 45.0355, lon: 38.9753 },
  "Нижний Новгород": { lat: 56.2965, lon: 43.9361 },
  Самара: { lat: 53.1959, lon: 50.1002 },
  Уфа: { lat: 54.7388, lon: 55.9721 },
  Ростов: { lat: 47.2225, lon: 39.7187 },
  Астрахань: { lat: 46.3479, lon: 48.0336 },
  Владивосток: { lat: 43.1155, lon: 131.8855 },
  Сочи: { lat: 43.5855, lon: 39.7231 },
};

export function findCityCenter(query: string): { lat: number; lon: number; city: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const [name, coords] of Object.entries(CITY_CENTERS)) {
    if (name.toLowerCase().startsWith(q) || q.startsWith(name.toLowerCase())) {
      return { ...coords, city: name };
    }
  }
  return null;
}

export function generatePvzAround(city: string, lat: number, lon: number, count = 6): PvzPoint[] {
  const streets = [
    "ул. Ленина",
    "пр. Мира",
    "ул. Гагарина",
    "ул. Пушкина",
    "пр. Победы",
    "ул. Советская",
    "ул. Кирова",
    "ул. Молодёжная",
  ];
  const points: PvzPoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 0.008 + (i % 3) * 0.006; // ~0.9-2.4 км
    points.push({
      id: `pvz-${city}-${i}`,
      name: `Ozon · ${streets[i % streets.length]}`,
      address: `${city}, ${streets[i % streets.length]}, д. ${5 + i * 3}`,
      city,
      lat: lat + Math.sin(angle) * radius,
      lon: lon + Math.cos(angle) * radius,
      hours: i % 2 === 0 ? "09:00–21:00" : "10:00–22:00",
    });
  }
  return points;
}

/** Расстояние в км по формуле гаверсинуса. */
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Автоматический расчёт цены доставки Ozon от склада до ПВЗ. */
export function calcOzonPrice(distanceKm: number): number {
  const base = 249;
  const perKm = 4.5;
  return Math.round((base + distanceKm * perKm) / 10) * 10;
}