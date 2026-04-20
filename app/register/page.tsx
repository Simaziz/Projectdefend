"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email, password }),
    });

    if (res.ok) {
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Account created but login failed. Please log in manually.");
        setLoading(false);
      }
    } else {
      const data = await res.json();
      setError(data.error ?? "Registration failed. Email might already exist.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-800/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-10 pb-6 border-b border-white/10 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mx-auto mb-4">
              <span className="text-2xl">☕</span>
            </div>
            <h1 className="font-serif italic text-3xl text-white leading-none">Join Cozy Cup</h1>
            <p className="text-[11px] uppercase tracking-[0.3em] text-orange-200/40 mt-2">
              Create your account
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200/60">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  placeholder="Your name"
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-400/60 transition-all duration-200 w-full"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200/60">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-400/60 transition-all duration-200 w-full"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200/60">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    placeholder="Min 8 characters"
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-400/60 transition-all duration-200 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-lg"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${["", "bg-red-500", "bg-yellow-400", "bg-green-500"][strength]}`}
                        style={{ width: `${(strength / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-white/40">
                      {["", "Weak", "Good", "Strong"][strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200/60">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirm}
                    placeholder="Repeat your password"
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`bg-white/5 border rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200 w-full
                      ${confirm.length > 0
                        ? password === confirm
                          ? "border-green-500/50 focus:border-green-400"
                          : "border-red-500/50 focus:border-red-400"
                        : "border-white/10 focus:border-orange-400/60"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-lg"
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {/* Match indicator */}
                {confirm.length > 0 && (
                  <p className={`text-[10px] pl-1 font-black uppercase tracking-widest ${password === confirm ? "text-green-400" : "text-red-400"}`}>
                    {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-400 text-white transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-xs text-white/30 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-300 hover:text-orange-200 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}