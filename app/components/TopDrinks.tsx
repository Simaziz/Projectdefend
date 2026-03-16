"use client";

import { useRef } from "react";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { Coffee } from "../types";

export default function TopDrink({ products }: { products: Coffee[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const topDrinks = products.filter(p => p.isTopDrink);

  console.log("Top drinks:", topDrinks);

  if (topDrinks.length === 0) return <p className="text-center">No top drinks yet.</p>;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <div className="py-10 bg-[#fcfaf8] flex flex-col items-center">
      <h2 className="group relative text-2xl sm:text-3xl font-black mb-8 text-orange-500 uppercase tracking-[0.25em] cursor-default transition-all duration-300 hover:text-orange-600">
        <span className="inline-block transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-120 mr-2">
          🥤
        </span>
        Top Drinks
        <span className="absolute -bottom-2 left-1/2 w-0 h-1 bg-orange-500 transition-all duration-500 group-hover:w-1/2 group-hover:left-1/4 rounded-full"></span>
      </h2>

      {/* Container */}
      <div className="relative w-full sm:w-[85%] lg:w-[70%] px-4 sm:px-0">

        {/* Left Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-[-12px] sm:left-[-18px] top-1/2 -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shadow-md text-xl"
        >
          ‹
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {topDrinks.map((coffee) => (
            <div
              key={coffee._id}
              className="min-w-[130px] max-w-[130px] sm:min-w-[160px] sm:max-w-[160px] flex-shrink-0 bg-white rounded-3xl p-2 sm:p-3 shadow-md border border-orange-500"
            >
              <div className="relative w-full aspect-video sm:aspect-square mb-2 sm:mb-3 overflow-hidden rounded-2xl bg-stone-100">
                <Image
                  src={coffee.image || "/images/coffee-placeholder.jpg"}
                  alt={coffee.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-bold text-stone-800 text-xs sm:text-sm truncate">{coffee.name}</h3>
              <p className="text-orange-900 font-semibold text-xs sm:text-sm">${coffee.price}</p>
              <div className="scale-75 sm:scale-100 origin-left mt-1">
                <AddToCartButton coffee={coffee} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-[-12px] sm:right-[-18px] top-1/2 -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shadow-md text-xl"
        >
          ›
        </button>

      </div>
    </div>
  );
}