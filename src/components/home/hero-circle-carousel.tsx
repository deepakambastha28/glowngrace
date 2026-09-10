"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { fetchProducts } from "@/lib/api";

const CATEGORY_GRADIENT: Record<string, string> = {
  Makeup: "linear-gradient(135deg,#d6336c,#f4a6c0)",
  Skincare: "linear-gradient(135deg,#2e9e6b,#a8e0c5)",
  "Nail Care": "linear-gradient(135deg,#c9a35b,#f0d9a8)",
  Fragrances: "linear-gradient(135deg,#3b82c9,#a8c9f0)",
};

export function HeroCircleCarousel() {
  const [items, setItems] = useState<Product[]>([]);
  const featured = useMemo(() => items.slice(0, 4), [items]);
  const count = featured.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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

  const next = useCallback(
    () => setIndex((i) => (count === 0 ? 0 : (i + 1) % count)),
    [count]
  );

  useEffect(() => {
    if (paused || count === 0) return;
    const t = setInterval(next, 3500);
    return () => clearInterval(t);
  }, [paused, next, count]);

  return (
    <div
      className="hero-circle"
      data-testid="hero-circle"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="hc-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {featured.map((p, i) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="hc-slide"
            data-testid="hero-circle-product"
            data-active={i === index}
            style={{ background: CATEGORY_GRADIENT[p.category] }}
            aria-label={p.name}
            tabIndex={i === index ? 0 : -1}
          >
            <span className="hc-emoji">{p.emoji}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}