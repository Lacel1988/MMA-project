import { UnitSystem } from "../context/UnitContext";

export function formatHeight(cm: number, unit: UnitSystem): string {
  if (unit === "EU") return `${cm} cm`;
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const inch = Math.round(inches - feet * 12);
  return `${feet}'${inch}"`;
}

export function formatWeight(kg: number, unit: UnitSystem): string {
  if (unit === "EU") return `${kg} kg`;
  return `${Math.round(kg * 2.20462)} lbs`;
}

export function formatReach(cm: number, unit: UnitSystem): string {
  if (unit === "EU") return `${cm} cm`;
  return `${Math.round(cm / 2.54)} in`;
}
