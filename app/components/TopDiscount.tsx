"use client";
import AddToCartButton from "./AddToCartButton";
import { useState } from "react";
import ProductScroll from "./ProductScroll";
import { Coffee } from "../types";

export default function TopDiscount({ products }: { products: Coffee[] }) {
  const discountProducts = products.filter(p => (p.discount ?? 0) > 0);
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? discountProducts : discountProducts.slice(0, 6);

  if (discountProducts.length === 0) return null;

  return (
    <div className="relative overflow-hidden px-6 py-10"
      style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0800 70%, #0d0400 100%)",
      }}
    >
      {/* Decorative blurred orbs */}
      <div className="absolute top-[-40px] left-[-40px] w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #c97c2f, transparent 70%)" }}
      />
      <div className="absolute bottom-[-30px] right-[-30px] w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #e8a84a, transparent 70%)" }}
      />

      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="h-px flex-1 opacity-30" style={{ background: "linear-gradient(to right, transparent, #c97c2f)" }} />
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h2
            className="text-2xl font-bold tracking-widest uppercase"
            style={{
              color: "#e8c07a",
              textShadow: "0 0 30px rgba(201,124,47,0.5)",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.2em",
            }}
          >
            Top Discount
          </h2>
          <span className="text-lg">🔥</span>
        </div>
        <div className="h-px flex-1 opacity-30" style={{ background: "linear-gradient(to left, transparent, #c97c2f)" }} />
      </div>

      {/* Badge */}
      <div className="relative z-10 flex justify-center mb-6">
        <span
          className="text-xs font-semibold tracking-widest uppercase px-4 py-1 rounded-full border"
          style={{
            color: "#c97c2f",
            borderColor: "rgba(201,124,47,0.4)",
            background: "rgba(201,124,47,0.08)",
            letterSpacing: "0.15em",
          }}
        >
          Limited Time Offers
        </span>
      </div>

  {/* Products */}
<div className="relative z-10 w-full flex justify-center">
  <ProductScroll products={displayed} wrap />
</div>

      {/* View All Button */}
      {discountProducts.length > 6 && (
        <div className=" grid justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-2.5 rounded-full font-semibold text-sm tracking-widest uppercase transition-all duration-300"
            style={{
              color: "#1a0800",
              background: "linear-gradient(135deg, #e8a84a, #c97c2f)",
              boxShadow: "0 4px 20px rgba(201,124,47,0.4)",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.12em",
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(201,124,47,0.65)";
              (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(201,124,47,0.4)";
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {showAll ? "Show Less" : "View All Deals"}
          </button>
        </div>
      )}
    </div>
  );
}