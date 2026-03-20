import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";
import Image from "next/image";
import AddToCartButton from "../components/AddToCartButton";
import MenuAnimations from "../components/MenuAnimations";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  await dbConnect();
  const rawCoffees = await Product.find({});
  const coffees = JSON.parse(JSON.stringify(rawCoffees));

  return (
    <div className="min-h-screen bg-[#fcfaf8] pb-20">

      {/* Hero Header Section */}
      <div className="relative h-[40vh] flex items-center justify-center bg-stone-900 overflow-hidden">

        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-orange-400 transition-all duration-300 group px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 hover:border-orange-400/30"
          >
            <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-semibold tracking-wide uppercase">Back</span>
          </Link>
        </div>

        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        <div className="relative text-center z-10 px-4">
          <span className="text-orange-500 uppercase tracking-[0.3em] text-xs font-bold mb-3 block">
            Crafted with Passion
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 italic">
            The Signature Collection
          </h1>
          <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <MenuAnimations>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {coffees.map((coffee: any) => {
              const discount = coffee.discount ?? 0;
              const hasDiscount = discount > 0;
              const discountedPrice = hasDiscount
                ? (coffee.price * (1 - discount / 100)).toFixed(2)
                : null;

              return (
                <div
                  key={coffee._id}
                  className="group relative bg-white rounded-[2rem] p-3 transition-all duration-500 hover:-translate-y-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-10px_rgba(120,60,20,0.15)] border border-stone-100/50"
                >
                  <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-[1.5rem] bg-stone-100">

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md tracking-wide">
                        -{discount}%
                      </span>
                    )}

                    <Image
                      src={coffee.image || "/images/coffee-placeholder.jpg"}
                      alt={coffee.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Price Badge */}
                    <div className="absolute top-2 right-2 backdrop-blur-md bg-white/70 px-2.5 py-1 rounded-xl shadow-sm border border-white/50">
                      {hasDiscount ? (
                        <div className="flex flex-col items-end">
                          <span className="text-stone-400 line-through text-[9px] leading-none">
                            ${coffee.price.toFixed(2)}
                          </span>
                          <span className="text-red-500 font-black text-[11px] leading-tight">
                            ${discountedPrice}
                          </span>
                        </div>
                      ) : (
                        <p className="text-orange-950 font-black text-[11px]">
                          ${coffee.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-1 pb-1">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="text-sm font-bold text-stone-800 tracking-tight group-hover:text-orange-900 transition-colors truncate">
                        {coffee.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className={`h-1.5 w-1.5 rounded-full ${coffee.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                        {coffee.stock > 0 ? `${coffee.stock} in stock` : "Out of stock"}
                      </p>
                    </div>
                    <div className="z-10">
                      <AddToCartButton coffee={coffee} />
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -right-2 text-stone-50 pointer-events-none -z-10 group-hover:text-orange-50 transition-colors">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="100" cy="100" r="100" fill="currentColor" fillOpacity="0.5" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </MenuAnimations>
      </div>
    </div>
  );
}