import { createContext, useContext, useMemo, useState } from "react";

export type UnitSystem = "US" | "EU";

type UnitContextValue = {
  unit: UnitSystem;
  toggleUnit: () => void;
};

const UnitContext = createContext<UnitContextValue | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem("unitSystem");
    return saved === "EU" || saved === "US" ? saved : "US";
  });

  function toggleUnit() {
    const next = unit === "US" ? "EU" : "US";
    setUnit(next);
    localStorage.setItem("unitSystem", next);
  }

  const value = useMemo(
    () => ({
      unit,
      toggleUnit,
    }),
    [unit]
  );

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const ctx = useContext(UnitContext);

  if (!ctx) {
    throw new Error("useUnit must be used within UnitProvider");
  }

  return ctx;
}