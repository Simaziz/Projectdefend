import Image from "next/image";
import { getProducts } from "@/lib/getProducts";
import ProductScroll from "../app/components/ProductScroll";
import TopDrink from "../app/components/TopDrinks";
import TopDiscount from "../app/components/TopDiscount";
import { Coffee } from "../app/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const coffees: Coffee[] = await getProducts(50); // fetch all products

  console.log("All coffees:", coffees); // debugging

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
      <TopDiscount products={coffees} />

      {/* All Menu */}
      <div className="p-6 bg-[#fcfaf8]">
        <h2 className="text-5xl font-bold mb-4 flex justify-center text-orange-500 uppercase">
          Menu
        </h2>
        <ProductScroll products={coffees} />
      </div>
    </div>
  );
}