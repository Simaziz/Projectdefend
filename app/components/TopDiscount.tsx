import ProductScroll from "./ProductScroll";
import { Coffee } from "../types";

export default function TopDiscount({ products }: { products: Coffee[] }) {
  const discountProducts = products.filter(p => (p.discount ?? 0) > 0);

  console.log("Discount products:", discountProducts); // debugging

  if (discountProducts.length === 0) return <p className="text-center">No discounted products yet.</p>;

  return (
    <div className="p-6 bg-[#fcfaf8]">
      <h2 className="text-2xl font-bold mb-4">🔥 Top Discount</h2>
      <ProductScroll products={discountProducts} />
    </div>
  );
}