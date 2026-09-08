"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { stats, trustItems } from "@/lib/data";

export function Hero() {
  return (
    <>
      <section
        className="overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg,#fff5f7 0%,#fdeef2 55%,#f9e4ec 100%)",
        }}
      >
        <div className="mx-auto max-w-screen-xl px-6 grid md:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-[70px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="eyebrow">Lucknow&apos;s Premier Beauty Destination</p>
            <h1 className="mt-4 text-[2.3rem] md:text-[3.3rem] leading-[1.15] max-w-xl">
              Discover Your <em className="text-rose italic">Radiant</em> Beauty
              &amp; Career
            </h1>
            <p className="mt-5 text-muted text-[1.12rem] max-w-[480px]">
              Shop premium women&apos;s cosmetics and skincare, or launch your
              dream career in the beauty industry with our trusted parlour
              placement services.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary" data-testid="hero-shop">
                Shop Cosmetics
              </Link>
              <Link href="/careers" className="btn-outline" data-testid="hero-career">
                Find a Career
              </Link>
            </div>
            <div className="mt-11 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <h3 className="text-[1.9rem] font-bold text-rose">{stat.value}</h3>
                  <p className="text-[0.85rem] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative hidden md:grid place-items-center py-10"
          >
            <div className="relative grid h-[380px] w-[380px] place-items-center rounded-full bg-rose-gradient shadow-rose">
              <span className="absolute -inset-[18px] rounded-full border-2 border-dashed border-gold/50" />
              <span className="text-[8.5rem] drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
                💄
              </span>
            </div>
            <div className="absolute top-[30px] left-[-10px] flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-[0.85rem] font-semibold shadow-rose">
              <span>🌸</span> Premium Skincare
            </div>
            <div className="absolute bottom-[40px] right-[-15px] flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-[0.85rem] font-semibold shadow-rose">
              <span>💼</span> 200+ Jobs Placed
            </div>
            <div className="absolute bottom-[120px] left-[-30px] flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-[0.85rem] font-semibold shadow-rose">
              <span>⭐</span> 4.9 Rated Store
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-white border-b border-line py-[30px]">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap justify-around gap-5">
          {trustItems.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 text-muted font-semibold text-[0.95rem]"
            >
              <span className="text-[1.6rem]">{item.emoji}</span> {item.text}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}