"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { products, categories } from "@/lib/data";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";

type SortOption = "trending" | "price-asc" | "price-desc" | "rating";

const categoryOptions = ["All", ...categories.map((c) => c.name)];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("trending");

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = [...result].sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [search, category, sort]);

  return (
    <div className="pb-16">
      {/* Breadcrumb band */}
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Shop</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-14">
        <div className="section-head">
          <p className="eyebrow">Product Collection</p>
          <h1>Explore Our Curated Beauty Range</h1>
          <p>
            {filteredProducts.length} premium product
            {filteredProducts.length !== 1 && "s"} — authentic, affordable,
            Love Lucknow.
          </p>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-7">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-5 py-2 text-[0.88rem] font-semibold transition-all duration-300 cursor-pointer",
                category === cat
                  ? "bg-rose text-white shadow-rose"
                  : "bg-white border-2 border-line text-muted hover:border-rose hover:text-rose"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + sort row */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-rose" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="field-input !rounded-full !pl-12"
              data-testid="product-search"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort products"
            className="field-input !rounded-full sm:w-[220px] cursor-pointer"
            data-testid="product-sort"
          >
            <option value="trending">Sort: Trending</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating: Highest</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted">
              Try adjusting your search or picking another category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="btn-outline mt-6 !px-6 !py-2.5"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}