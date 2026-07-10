import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme-store";

const options: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Светлая", Icon: Sun },
  { value: "system", label: "Системная", Icon: Monitor },
  { value: "dark", label: "Тёмная", Icon: Moon },
];

export function ThemeToggle() {
  const [mode, set] = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Тема оформления"
      className="hidden items-center gap-0.5 rounded-full border border-hairline bg-surface p-0.5 sm:inline-flex"
    >
      {options.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => set(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}

export function ThemeToggleCompact() {
  const [mode, set] = useTheme();
  const next: ThemeMode =
    mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun;
  return (
    <button
      type="button"
      onClick={() => set(next)}
      aria-label={`Тема: ${mode}. Переключить`}
      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}