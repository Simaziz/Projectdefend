"use client";

import { useEffect, useRef, useState } from "react";
import { addCoffee, updateCoffee, deleteCoffee } from "../../actions/products"; // adjust path if needed
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all products from MongoDB
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

  // Delete product
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
            <p className="text-white/40 text-sm mt-2">
              Manage your menu drinks here.
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 text-center">
              <p className="text-white/50 text-xs mb-1">Total Drinks</p>
              <p className="text-3xl text-white font-serif">{products.length}</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-4 rounded-2xl font-bold text-sm transition active:scale-95"
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
          <div className="flex justify-center items-center mt-16">
            <Loader2 className="animate-spin text-stone-400" size={36} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-stone-400 gap-3">
            <PackageSearch size={40} />
            <p className="italic">No products yet. Add your first drink!</p>
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

      {/* ADD MODAL */}
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

      {/* EDIT MODAL */}
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

      {/* DELETE CONFIRM */}
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

function ProductCard({
  product,
  deletingId,
  onEdit,
  onDelete,
}: {
  product: Product;
  deletingId: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">

      {/* Image */}
      <div className="relative w-full h-44 bg-stone-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Coffee size={32} />
          </div>
        )}

        {/* Top Drink Badge */}
        {product.isTopDrink && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="white" />
            Top
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-stone-900 text-sm mb-1 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-orange-500 font-bold">${product.price.toFixed(2)}</p>
          <p className="text-[11px] text-stone-400">Stock: {product.stock}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deletingId === product._id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition active:scale-95 disabled:opacity-50"
          >
            {deletingId === product._id
              ? <Loader2 size={12} className="animate-spin" />
              : <Trash2 size={12} />
            }
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT MODAL (ADD / EDIT) ───────────────────────────────────────────────

function ProductModal({
  mode,
  product,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(product?.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Modal Header */}
        <div className="bg-[#1c1917] px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="text-orange-400 text-[10px] tracking-[0.3em] uppercase">Menu</p>
            <h2 className="text-white font-serif italic text-2xl">
              {mode === "add" ? "Add New Drink" : "Edit Drink"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form — same style as your original page */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Card sub-header */}
          <div className="bg-orange-50 border border-orange-100 px-4 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <Coffee size={14} className="text-orange-600" />
            </div>
            <p className="font-bold text-stone-800 text-sm">Drink Details</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-2">
              Drink Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-44 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 hover:border-orange-300 hover:bg-orange-50 transition cursor-pointer flex items-center justify-center overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-stone-400">
                  <ImageIcon className="mx-auto mb-2" size={28} />
                  <p className="text-xs font-medium">Click to upload image</p>
                  <p className="text-[11px] mt-1 text-stone-300">PNG, JPG supported</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {mode === "edit" && (
              <p className="text-[11px] text-stone-400 mt-1">
                Leave empty to keep the current image
              </p>
            )}
          </div>

          {/* Drink Name */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-1">
              Drink Name
            </label>
            <input
              name="name"
              required
              defaultValue={product?.name}
              placeholder="e.g. Iced Caramel Latte"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-1">
                Price ($)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={product?.price}
                placeholder="4.50"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-1">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={product?.stock ?? 10}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block mb-1">
              Discount (%)
            </label>
            <input
              name="discount"
              type="number"
              min="0"
              max="100"
              defaultValue={product?.discount ?? 0}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition"
            />
          </div>

          {/* Top Drink Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl hover:bg-stone-50 transition">
            <input
              type="checkbox"
              name="isTopDrink"
              defaultChecked={product?.isTopDrink}
              className="w-4 h-4 accent-orange-500"
            />
            <div>
              <p className="text-sm font-bold text-stone-700">Feature as Top Drink</p>
              <p className="text-[11px] text-stone-400">Shows on the homepage highlights</p>
            </div>
          </label>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          {/* Success */}
          {success && (
            <p className="text-emerald-600 text-xs bg-emerald-50 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={14} />
              {mode === "add" ? "Drink added successfully!" : "Drink updated successfully!"}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-sm tracking-widest uppercase transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : success ? (
              <><CheckCircle2 size={14} /> {mode === "add" ? "Added!" : "Updated!"}</>
            ) : (
              mode === "add" ? "Add to Menu" : "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM DIALOG ────────────────────────────────────────────────────

function ConfirmDelete({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="font-bold text-stone-900 text-lg mb-1">Delete Drink?</h3>
        <p className="text-stone-400 text-sm mb-6">
          This cannot be undone. The drink will be permanently removed from the menu.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}