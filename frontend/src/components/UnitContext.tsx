import React, { createContext, useContext, useMemo, useState } from "react";

export type UnitSystem = "EU" | "US";

type UnitContextValue = {
  unit: UnitSystem;
  toggleUnit: () => void;
};

const UnitContext = createContext<UnitContextValue | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem("unitSystem");
    return (saved as UnitSystem) || "EU";
  });

  const toggleUnit = () => {
    const next = unit === "EU" ? "US" : "EU";
    setUnit(next);
    localStorage.setItem("unitSystem", next);
  };

  const value = useMemo(() => ({ unit, toggleUnit }), [unit]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
};

export const useUnit = () => {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used within UnitProvider");
  return ctx;
};
