export default class APIService {
  static async loadData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load data");
  return res.json() as Promise<T>;
}


  static async createItem<T>(url: string, data: T): Promise<void> {
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxNTkyMTAzLCJpYXQiOjE3NzE1OTAzMDMsImp0aSI6IjM2YzZhYWYwNWM3OTRkMzZiMzg1MDcxNWFkNDlhOWRhIiwidXNlcl9pZCI6IjEifQ._5Z3qb9ctdpN7qB-QWwwbN_zmjefZmeNozqGih8f8nY"}`

      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create item");
  }

  static async updateItem<T extends { id: number }>(url: string, data: T): Promise<void> {
    const res = await fetch(`${url}${data.id}/`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxNTkyMTAzLCJpYXQiOjE3NzE1OTAzMDMsImp0aSI6IjM2YzZhYWYwNWM3OTRkMzZiMzg1MDcxNWFkNDlhOWRhIiwidXNlcl9pZCI6IjEifQ._5Z3qb9ctdpN7qB-QWwwbN_zmjefZmeNozqGih8f8nY"}`
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update item");
  }

  static async deleteItem(url: string, id: number): Promise<void> {
    const res = await fetch(`${url}${id}/`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxNTkyMTAzLCJpYXQiOjE3NzE1OTAzMDMsImp0aSI6IjM2YzZhYWYwNWM3OTRkMzZiMzg1MDcxNWFkNDlhOWRhIiwidXNlcl9pZCI6IjEifQ._5Z3qb9ctdpN7qB-QWwwbN_zmjefZmeNozqGih8f8nY"}`
      },
    });
    if (!res.ok) throw new Error("Failed to delete item");
  }
}