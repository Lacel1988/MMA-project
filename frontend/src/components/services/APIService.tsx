
// src/services/APIService.ts
export default class APIService {
  static async loadData<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Hiba az adatok betöltésekor");
    return res.json();
  }

  static async createItem<T>(url: string, data: T): Promise<void> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Hiba a létrehozás során");
  }

  static async updateItem<T extends { id: number }>(url: string, data: T): Promise<void> {
    const res = await fetch(`${url}${data.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Hiba a frissítés során");
  }

  static async deleteItem(url: string, id: number): Promise<void> {
    const res = await fetch(`${url}${id}/`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Hiba a törlés során");
  }
}