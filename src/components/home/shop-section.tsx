import Link from "next/link";
import { categories, products } from "@/lib/data";
import { ProductCard } from "@/components/shop/product-card";

export function ShopCategories() {
  return (
    <section className="section">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="section-head">
          <p className="eyebrow">Shop by Category</p>
          <h2>Everything to Enhance Your Beauty</h2>
          <p>Explore our curated collection of premium cosmetic and beauty products.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, i) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="card group !rounded-[20px] px-[22px] py-8 text-center cursor-pointer"
              data-testid={`category-${category.name.toLowerCase()}`}
            >
              <div className="mx-auto mb-5 grid h-[72px] w-[72px] place-items-center rounded-full bg-rose-blush text-[2rem] transition-transform group-hover:scale-110">
                {category.emoji}
              </div>
              <h3 className="text-[1.15rem] mb-1.5">{category.name}</h3>
              <p className="text-[0.82rem] text-muted">{category.description}</p>
              <span className="sr-only">{`Shop ${category.name}`}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Bestsellers() {
  return (
    <section className="section bg-rose-blush">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="section-head">
          <p className="eyebrow">Bestsellers</p>
          <h2>Trending Beauty Picks</h2>
          <p>Handpicked favourites loved by women across Lucknow.</p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-[26px]"
          data-testid="product-grid"
        >
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-11">
          <Link href="/products" className="btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}