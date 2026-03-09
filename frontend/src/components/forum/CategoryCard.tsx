import TopicCard from "./TopicCard";

type Topic = any;

type Category = {
  id: number;
  name: string;
  description: string | null;
  topics: Topic[];
};

type Props = {
  category: Category;
};

export default function CategoryCard({ category }: Props) {
  return (
    <div className="forum-category">

      <div className="forum-category-title">
        {category.name}
      </div>

      {category.description && (
        <div>{category.description}</div>
      )}

      {category.topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}

    </div>
  );
}