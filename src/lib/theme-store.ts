import { useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";
const KEY = "sadova.theme";
const listeners = new Set<() => void>();
let mode: ThemeMode = "system";

function systemDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply() {
  if (typeof document === "undefined") return;
  const dark = mode === "dark" || (mode === "system" && systemDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function emit() {
  listeners.forEach((l) => l());
}

export function initTheme() {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem(KEY) as ThemeMode | null;
  mode = saved ?? "system";
  apply();
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => {
    if (mode === "system") apply();
  });
}

export function setTheme(next: ThemeMode) {
  mode = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, next);
  apply();
  emit();
}

export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const current = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => mode,
    () => "system" as ThemeMode,
  );
  useEffect(() => {
    // Ensure applied on mount (SSR hydration)
    apply();
  }, []);
  return [current, setTheme];
}