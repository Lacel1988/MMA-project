import React, { createContext, useContext, useMemo, useState } from "react";

export type UnitSystem = "EU" | "US";

type UnitContextValue = {
  unit: UnitSystem;
  setUnit: (u: UnitSystem) => void;
  toggleUnit: () => void;
};

const UnitContext = createContext<UnitContextValue | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnitState] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem("unitSystem");
    return (saved as UnitSystem) || "EU";
  });

  const setUnit = (u: UnitSystem) => {
    localStorage.setItem("unitSystem", u);
    setUnitState(u);
  };

  const toggleUnit = () => setUnit(unit === "EU" ? "US" : "EU");

  const value = useMemo(() => ({ unit, setUnit, toggleUnit }), [unit]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
};

export const useUnit = () => {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used within UnitProvider");
  return ctx;
};
