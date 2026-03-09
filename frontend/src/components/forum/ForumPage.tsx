import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import { listCategories } from "../../api/forumApi";

export default function ForumPage() {

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await listCategories();
      setCategories(data);
    }

    load();
  }, []);

  return (
    <div className="forum-container">

      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}

    </div>
  );
}