// Программа лояльности: уровни от суммы завершённых заказов + кэшбэк бонусами.
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export const tiers: {
  id: LoyaltyTier;
  label: string;
  minSpend: number;
  cashback: number; // % от суммы заказа возвращается бонусами
  color: string;
}[] = [
  { id: "bronze", label: "Bronze", minSpend: 0, cashback: 1, color: "#B08D57" },
  { id: "silver", label: "Silver", minSpend: 50_000, cashback: 3, color: "#A8A8A8" },
  { id: "gold", label: "Gold", minSpend: 200_000, cashback: 5, color: "#D4AF37" },
  { id: "platinum", label: "Platinum", minSpend: 500_000, cashback: 7, color: "#4B4B4B" },
];

export function tierFor(spend: number) {
  return [...tiers].reverse().find((t) => spend >= t.minSpend) ?? tiers[0];
}

export function nextTier(spend: number) {
  return tiers.find((t) => t.minSpend > spend);
}