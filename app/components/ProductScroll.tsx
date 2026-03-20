"use client";

import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

export default function ProductScroll({ products, wrap = false }: { products: any[], wrap?: boolean }) {
  return (
    <div className={wrap ? "w-full" : "overflow-x-auto"}>
      <div className={wrap ? "flex flex-wrap gap-3 sm:gap-6 pb-4 justify-center" : "flex gap-4 sm:gap-6 pb-4"}>
        {products.map((coffee: any) => {
          const discount = coffee.discount ?? 0;
          const hasDiscount = discount > 0;
          const discountedPrice = hasDiscount
            ? (coffee.price * (1 - discount / 100)).toFixed(2)
            : null;

          return (
            <div
              key={coffee._id}
              className={
                wrap
                  ? "min-w-[calc(33%-8px)] w-[calc(33%-8px)] sm:min-w-[220px] sm:w-auto bg-white rounded-3xl p-2 sm:p-4 shadow-md border-orange-500 border"
                  : "min-w-[220px] bg-white rounded-3xl p-4 shadow-md border-orange-500 border"
              }
            >
              {/* Image + Badge */}
              <div className="relative w-full aspect-video sm:aspect-square mb-2 sm:mb-4 overflow-hidden rounded-2xl bg-stone-100">
                {hasDiscount && (
                  <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
                    -{discount}%
                  </span>
                )}
                <Image
                  src={coffee.image || "/images/coffee-placeholder.jpg"}
                  alt={coffee.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name */}
              <h3 className="font-bold text-stone-800 text-[11px] sm:text-base truncate">{coffee.name}</h3>

              {/* Price */}
              {hasDiscount ? (
                <div className="flex flex-col mt-0.5">
                  <span className="text-stone-400 line-through text-[10px] sm:text-xs">
                    ${coffee.price.toFixed(2)}
                  </span>
                  <span className="text-red-500 font-bold text-[11px] sm:text-base">
                    ${discountedPrice}
                  </span>
                </div>
              ) : (
                <p className="text-orange-900 font-semibold text-[11px] sm:text-base mt-0.5">
                  ${coffee.price.toFixed(2)}
                </p>
              )}

              {/* Add to Cart */}
              <div className="scale-75 sm:scale-100 origin-left mt-1">
                <AddToCartButton coffee={coffee} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}