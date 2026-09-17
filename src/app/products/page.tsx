"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Product } from "@/lib/data";
import { fetchProducts, fetchShopConfig } from "@/lib/api";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SHOP_CONFIG,
  normalizeShopConfig,
  type ShopConfig,
  type ShopSectionKey,
} from "@/lib/shop-config";

type SortOption = "trending" | "price-asc" | "price-desc" | "rating";

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("trending");
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [bannerIndex, setBannerIndex] = useState(0);

  const bannerImages = useMemo(
    () => (config.banner.images ?? []).filter((src) => src.length > 0),
    [config.banner.images]
  );

  const categoryOptions = useMemo(() => {
    const configured = config.categories.map((c) => c.trim()).filter(Boolean);
    if (configured.length) return ["All", ...configured];
    return ["All", ...Array.from(new Set(items.map((p) => p.category).filter(Boolean)))];
  }, [items, config.categories]);

  useEffect(() => {
    let active = true;
    fetchShopConfig().then((res) => {
      if (!active) return;
      setConfig(normalizeShopConfig(res.data?.config ?? DEFAULT_SHOP_CONFIG));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchProducts().then((res) => {
      if (!active) return;
      if (res.data?.items?.length) setItems(res.data.items);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (bannerImages.length < 2) return;
    setBannerIndex(0);
    const id = setInterval(
      () => setBannerIndex((i) => (i + 1) % bannerImages.length),
      5000
    );
    return () => clearInterval(id);
  }, [bannerImages.length]);

  const filteredProducts = useMemo(() => {
    let result = items.filter((p) => {
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
  }, [items, search, category, sort]);

  const isSectionVisible = (key: ShopSectionKey): boolean => {
    const section = config.sections.find((s) => s.key === key);
    return section ? section.visible && !section.deleted : true;
  };

  const headingDescription = config.heading.description.replace(
    "{{count}}",
    String(filteredProducts.length)
  );

  return (
    <div className="pb-16">
      {/* Breadcrumb band */}
      <div data-testid="shop-breadcrumb" className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Shop</span>
        </div>
      </div>

      {/* Banner */}
      {isSectionVisible("banner") && (
        <div data-testid="shop-banner" className="relative overflow-hidden">
          {bannerImages.length > 0 && (
            <div className="absolute inset-0">
              {bannerImages.map((src, i) => (
                <div
                  key={i}
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                  style={{
                    backgroundImage: `url(${src})`,
                    opacity: i === bannerIndex ? 1 : 0,
                  }}
                />
              ))}
            </div>
          )}
          <div
            className="absolute inset-0"
            style={
              bannerImages.length > 0
                ? { background: "linear-gradient(180deg, rgba(43,35,48,0.15) 0%, rgba(43,35,48,0.55) 100%)" }
                : { background: "linear-gradient(135deg, #d6336c, #b02a5b)" }
            }
          />
          <div className="relative mx-auto max-w-screen-xl px-6 py-16 sm:py-20 text-center">
            {config.banner.title && (
              <h2 className="text-2xl sm:text-4xl font-bold text-white">
                {config.banner.title}
              </h2>
            )}
            {config.banner.subtitle && (
              <p className="mt-3 text-white/85 max-w-xl mx-auto">{config.banner.subtitle}</p>
            )}
            {bannerImages.length > 1 && (
              <div className="mt-5 flex justify-center gap-2">
                {bannerImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBannerIndex(i)}
                    aria-label={`Go to banner slide ${i + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === bannerIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={cn("mx-auto max-w-screen-xl px-6", isSectionVisible("banner") ? "pt-10" : "pt-14")}>
        {/* Section head */}
        {isSectionVisible("heading") && (
          <div data-testid="shop-heading" className="section-head">
            <p className="eyebrow">{config.heading.eyebrow}</p>
            <h1>{config.heading.title}</h1>
            <p>{headingDescription}</p>
          </div>
        )}

        {/* Category chips */}
        {isSectionVisible("categories") && (
          <div data-testid="shop-categories" className="flex flex-wrap justify-center gap-2.5 mb-7">
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
        )}

        {/* Search + sort row */}
        <div data-testid="shop-toolbar" className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-10">
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

        {/* Product grid */}
        <div data-testid="shop-grid">
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
    </div>
  );
}