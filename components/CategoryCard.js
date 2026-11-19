import Link from "next/link";
export default function CategoryCard({ category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group">
      <div className="card">
        <div className="overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="product-image transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-xl text-[#183d2b]">{category.name}</h3>
          <p className="mt-1 text-sm text-[#77786f]">{category.description}</p>
        </div>
      </div>
    </Link>
  );
}
