"use client";

import { useState, useRef, Suspense, useEffect } from "react";  // ← added useEffect
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Field({
  label, type = "text", value, onChange, placeholder, hint, disabled,
}: {
  label: string; type?: string; value: string;
  onChange?: (v: string) => void; placeholder?: string;
  hint?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200/60">
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
          placeholder-white/20 focus:outline-none focus:border-orange-400/60 transition-all
          duration-200 disabled:opacity-40 disabled:cursor-not-allowed w-full"
      />
      {hint && <p className="text-[10px] text-white/30 pl-1 mt-0.5">{hint}</p>}
    </div>
  );
}

function SaveButton({ loading, saved, label = "Save Changes" }: {
  loading: boolean; saved: boolean; label?: string;
}) {
  return (
    <button type="submit" disabled={loading}
      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest
        transition-all duration-300 active:scale-95 shadow-lg
        ${saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-400 text-white"}
        ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {loading ? "Saving…" : saved ? "✓ Saved!" : label}
    </button>
  );
}

function Card({ icon, title, children }: {
  icon: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <h2 className="text-[11px] uppercase tracking-[0.25em] font-black text-orange-200">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "profile",  label: "Profile",       icon: "✏️" },
  { key: "password", label: "Password",      icon: "🔒" },
  { key: "notifs",   label: "Notifications", icon: "🔔" },
  { key: "danger",   label: "Account",       icon: "⚠️" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, onNameUpdate }: { user: any; onNameUpdate: (name: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  // ← Keep local name in sync if session loads after mount
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }

      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 2500);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    if (!name.trim()) { setNameError("Name cannot be empty."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNameError(data.error ?? "Failed to update name.");
        return;
      }

      onNameUpdate(data.user.name);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setNameError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const src = preview ?? user?.image ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Card icon="🖼️" title="Profile Picture">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
              {src
                ? <Image src={src} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
                : <span className="text-3xl">👤</span>}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
              Change
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-white/40">JPG, PNG or GIF · max 2 MB</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 hover:border-orange-400 hover:text-orange-300 transition-all">
                Choose File
              </button>
              {preview && (
                <button type="button" onClick={handleUpload} disabled={uploading}
                  className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-400 text-white transition-all disabled:opacity-50">
                  {uploading ? "Uploading…" : uploadDone ? "✓ Done!" : "Upload"}
                </button>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </Card>

      <Card icon="✏️" title="Personal Information">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Display Name" value={name} onChange={setName} placeholder="Your name" />
          <Field label="Email Address" type="email" value={user?.email ?? ""} disabled
            hint="Email changes require verification — contact support." />
          {nameError && <p className="text-xs text-red-400 pl-1">{nameError}</p>}
          <div className="flex justify-end pt-1">
            <SaveButton loading={saving} saved={saved} />
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────
function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!current) { setError("Please enter your current password."); return; }
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to change password.");
        return;
      }

      setSaved(true);
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const strength = next.length === 0 ? 0 : next.length < 6 ? 1 : next.length < 10 ? 2 : 3;

  return (
    <Card icon="🔒" title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <Field label="Current Password" type="password" value={current} onChange={setCurrent} placeholder="••••••••" />
        <Field label="New Password" type="password" value={next} onChange={setNext} placeholder="Min 8 characters" />

        {next.length > 0 && (
          <div className="flex items-center gap-3 -mt-1">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${["","bg-red-500","bg-yellow-400","bg-green-500"][strength]}`}
                style={{ width: `${(strength / 3) * 100}%` }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black text-white/40">
              {["","Weak","Good","Strong"][strength]}
            </span>
          </div>
        )}

        <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" />
        {error && <p className="text-xs text-red-400 pl-1">{error}</p>}

        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} saved={saved} label="Update Password" />
        </div>
      </form>
    </Card>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
const NOTIF_ITEMS = [
  { key: "orders",    label: "Order Updates",     desc: "Status changes for your active orders" },
  { key: "promos",    label: "Promotions & Deals", desc: "Seasonal offers and loyalty rewards" },
  { key: "news",      label: "Cozy Cup News",      desc: "New menu items and announcements" },
  { key: "reminders", label: "Daily Reminders",    desc: "Your morning coffee nudge ☕" },
] as const;
type NotifKey = (typeof NOTIF_ITEMS)[number]["key"];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>(
    { orders: true, promos: false, news: true, reminders: false }
  );
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card icon="🔔" title="Notification Preferences">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col divide-y divide-white/5">
          {NOTIF_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-white/80">{item.label}</p>
                <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
              </div>
              <button type="button"
                onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0
                  ${prefs[item.key] ? "bg-orange-500" : "bg-white/10 border border-white/20"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md
                  transition-transform duration-300 ${prefs[item.key] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <SaveButton loading={false} saved={saved} label="Save Preferences" />
        </div>
      </form>
    </Card>
  );
}

// ─── Danger Tab ───────────────────────────────────────────────────────────────
function DangerTab() {
  const [confirm, setConfirm] = useState(false);

  return (
    <Card icon="⚠️" title="Danger Zone">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-red-400">Delete Account</p>
          <p className="text-[11px] text-white/30 mt-1 max-w-xs">
            Permanently removes your account, orders, and data. This cannot be undone.
          </p>
        </div>
        {!confirm ? (
          <button onClick={() => setConfirm(true)}
            className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all">
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-2 items-end">
            <p className="text-[10px] text-red-400 font-bold">Are you sure?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(false)}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 hover:border-white/40 transition-all">
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ProfilePageInner() {
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) ?? "profile"
  );

  // ← Force session re-sync on mount to pick up name after registration
  useEffect(() => {
    update();
  }, []);

  const user = session?.user;

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-orange-950 flex items-center justify-center">
        <p className="text-white/30 text-sm">Loading…</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  function switchTab(key: TabKey) {
    setTab(key);
    router.replace(`/profile?tab=${key}`, { scroll: false });
  }

  async function handleNameUpdate(newName: string) {
    await update({ name: newName });
  }

  return (
    <main className="min-h-screen bg-orange-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-900/60 to-transparent border-b border-white/5 px-6 md:px-12 pt-10 pb-8">
        <div className="max-w-3xl mx-auto flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center text-2xl shrink-0">
            {user?.image
              ? <Image src={user.image} alt="avatar" width={56} height={56} className="object-cover w-full h-full" />
              : "👤"}
          </div>
          <div>
            <h1 className="font-serif italic text-2xl md:text-3xl leading-none">
              {user?.name ?? "Your Profile"}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange-200/40 mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-0 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 mb-8">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200
                ${tab === t.key ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white/70"}`}>
              <span className="hidden sm:inline">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "profile"  && <ProfileTab user={user} onNameUpdate={handleNameUpdate} />}
        {tab === "password" && <PasswordTab />}
        {tab === "notifs"   && <NotificationsTab />}
        {tab === "danger"   && <DangerTab />}
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfilePageInner />
    </Suspense>
  );
}