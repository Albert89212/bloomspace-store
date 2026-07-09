import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
}

// Demo-only admin flag persisted in localStorage.
// Backend replaces this with a real JWT role check (server/src/middleware/auth.ts).
export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      setAdmin: (v) => set({ isAdmin: v }),
    }),
    { name: "sadova-admin" },
  ),
);