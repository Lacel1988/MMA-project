export default class APIService {
  static async loadData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load data");
  return res.json() as Promise<T>;
}


  static async createItem<T>(url: string, data: T): Promise<void> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create item");
  }

  static async updateItem<T extends { id: number }>(url: string, data: T): Promise<void> {
    const res = await fetch(`${url}${data.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update item");
  }

  static async deleteItem(url: string, id: number): Promise<void> {
    const res = await fetch(`${url}${id}/`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
  }
}