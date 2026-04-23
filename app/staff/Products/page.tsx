"use client";

import { useEffect, useRef, useState } from "react";
import { addCoffee, updateCoffee, deleteCoffee } from "../../actions/products"; 
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Coffee,
  Pencil,
  Trash2,
  Plus,
  X,
  Star,
  PackageSearch,
} from "lucide-react";
import Image from "next/image";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  discount: number;
  isTopDrink: boolean;
  image: string;
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = () => {
    setFetching(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const formData = new FormData();
    formData.append("id", id);
    const result = await deleteCoffee(formData);
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
    setDeletingId(null);
    setDeleteId(null);
  };

  return (
    <main className="min-h-screen bg-[#f6f5f3] pb-24">
      {/* HEADER */}
      <div className="bg-[#1c1917] pt-16 pb-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-end gap-6">
          <div>
            <p className="text-orange-400 text-xs tracking-[0.3em] uppercase mb-2">
              Staff Dashboard
            </p>
            <h1 className="text-5xl font-serif italic text-white">Products</h1>
            <p className="text-white/40 text-sm mt-2">Manage your menu drinks here.</p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 text-center">
              <p className="text-white/50 text-xs mb-1">Total Drinks</p>
              <p className="text-3xl text-white font-serif">{products.length}</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-4 rounded-2xl font-bold text-sm transition active:scale-95 shadow-lg shadow-orange-900/20"
            >
              <Plus size={18} />
              Add Drink
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-6xl mx-auto px-6 -mt-20">
        {fetching ? (
          <div className="flex justify-center items-center mt-32">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-stone-400 gap-3">
            <PackageSearch size={48} className="opacity-20" />
            <p className="italic font-medium">No products yet. Add your first drink!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                deletingId={deletingId}
                onEdit={() => setEditProduct(product)}
                onDelete={() => setDeleteId(product._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAdd && (
        <ProductModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            fetchProducts();
          }}
        />
      )}

      {editProduct && (
        <ProductModal
          mode="edit"
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSuccess={() => {
            setEditProduct(null);
            fetchProducts();
          }}
        />
      )}

      {deleteId && (
        <ConfirmDelete
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          loading={deletingId === deleteId}
        />
      )}
    </main>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ product, deletingId, onEdit, onDelete }: any) {
  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div className="relative w-full h-48 bg-stone-100 overflow-hidden">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Coffee size={32} />
          </div>
        )}
        {product.isTopDrink && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <Star size={10} fill="white" /> Top
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-stone-900 text-base mb-1 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mb-5">
          <p className="text-orange-600 font-bold text-lg">${product.price.toFixed(2)}</p>
          <div className="px-2 py-1 bg-stone-50 rounded-lg border border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Stock: {product.stock}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 text-xs font-bold transition duration-300">
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deletingId === product._id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold transition duration-300 disabled:opacity-50"
          >
            {deletingId === product._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── THE FIXED MODAL (RESPONSIVE & CENTERED) ──────────────────────────────────

function ProductModal({ mode, product, onClose, onSuccess }: any) {
  const [preview, setPreview] = useState<string | null>(product?.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // FIX: Lock background scrolling and force modal into the center of the visual viewport
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    let result;
    if (mode === "edit" && product) {
      formData.append("id", product._id);
      formData.append("existingImage", product.image);
      result = await updateCoffee(null, formData);
    } else {
      result = await addCoffee(null, formData);
    }

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => onSuccess(), 1000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] relative border border-white/20">
        
        {/* Modal Header */}
        <div className="bg-[#1c1917] px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <p className="text-orange-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-1">Staff Portal</p>
            <h2 className="text-white font-serif italic text-3xl">
              {mode === "add" ? "Create Drink" : "Modify Drink"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-white active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-1">Visual Identity</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-[2rem] border-2 border-dashed border-stone-200 bg-stone-50 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer flex items-center justify-center overflow-hidden group relative"
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Plus className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-stone-400 p-4">
                      <ImageIcon className="mx-auto mb-2 opacity-30" size={40} />
                      <p className="text-xs font-bold uppercase tracking-tighter">Click to Upload</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {/* Right Column: Basic Info */}
              <div className="flex flex-col justify-between py-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 px-1">Drink Title</label>
                    <input name="name" required defaultValue={product?.name} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm focus:border-orange-500 focus:bg-white outline-none transition" placeholder="e.g. Espresso Romano" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 px-1">Price ($)</label>
                      <input name="price" type="number" step="0.01" required defaultValue={product?.price} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-orange-500 focus:bg-white transition" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 px-1">Stock</label>
                      <input name="stock" type="number" required defaultValue={product?.stock ?? 10} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-orange-500 focus:bg-white transition" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              <div>
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 px-1">Discount Offer (%)</label>
                <input name="discount" type="number" defaultValue={product?.discount ?? 0} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-orange-500 focus:bg-white transition" />
              </div>
              <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all border border-stone-100 group">
                <input type="checkbox" name="isTopDrink" defaultChecked={product?.isTopDrink} className="w-6 h-6 accent-orange-500 rounded-lg cursor-pointer" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-800">Featured Item</p>
                  <p className="text-[10px] text-stone-400 font-medium">Show in hero section</p>
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                <p className="text-red-600 text-xs font-bold text-center">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm tracking-[0.2em] uppercase transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-orange-200 mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : success ? (
                <CheckCircle2 size={20} />
              ) : <Coffee size={20} />}
              {loading ? "SAVING..." : success ? "COMPLETE" : mode === "add" ? "ADD TO MENU" : "UPDATE MENU"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────

function ConfirmDelete({ onCancel, onConfirm, loading }: any) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl p-10 text-center border border-stone-100">
        <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center mx-auto mb-6">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="font-bold text-stone-900 text-2xl mb-2">Delete Item?</h3>
        <p className="text-stone-400 text-sm mb-8 leading-relaxed px-4">Are you sure? This product will be removed from your digital menu permanently.</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} disabled={loading} className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-red-100">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null} Yes, Remove Item
          </button>
          <button onClick={onCancel} className="w-full py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition active:scale-95">Go Back</button>
        </div>
      </div>
    </div>
  );
}