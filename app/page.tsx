import Image from "next/image";
import { getProducts } from "@/lib/getProducts";
import ProductScroll from "../app/components/ProductScroll";
import TopDrink from "../app/components/TopDrinks";
import TopDiscount from "../app/components/TopDiscount";
import { Coffee } from "../app/types";
// import { Link } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const coffees: Coffee[] = await getProducts(50);

  console.log("All coffees:", coffees);

  return (
    <div className="flex flex-col">
      {/* Poster */}
      <div className="relative flex-1 pt-70 h-[300px]">
        <Image
          src="/images/Cozycup.png"
          alt="Poster"
          fill
          className="object-cover"
        />
      </div>

      {/* Top Drinks */}
      <TopDrink products={coffees} />

      {/* Top Discount */}
      <div className="grid justify-center "
        style={{
          background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0800 70%, #0d0400 100%)",
        }}>
        <TopDiscount products={coffees} />
      </div>


      {/* All Menu */}
      <div className="p-6 bg-[#fcfaf8]">
        <div className="flex justify-center mb-4">
          <Link
            href="/menu"
            className="group relative inline-flex items-center justify-center text-5xl font-bold text-orange-500 uppercase px-12 py-3 rounded-2xl overflow-hidden transition-all duration-300 hover:text-white hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] origin-left rounded-2xl -z-10" />
            Menu
          </Link>
        </div>
        <ProductScroll products={coffees} />
      </div>
    </div>
  );
}