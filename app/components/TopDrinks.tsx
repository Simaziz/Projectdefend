import ProductScroll from "./ProductScroll";
import { Coffee } from "../types";

export default function TopDrink({ products }: { products: Coffee[] }) {
  // filter only top drinks
  const topDrinks = products.filter(p => p.isTopDrink);

  console.log("Top drinks:", topDrinks); // for debugging

  if (topDrinks.length === 0) return <p className="text-center">No top drinks yet.</p>;

  return (
    <div className="p-6 bg-[#fcfaf8]">
      <h2 className="text-2xl font-bold mb-4">🥤 Top Drinks</h2>
      <ProductScroll products={topDrinks} />
    </div>
  );
}