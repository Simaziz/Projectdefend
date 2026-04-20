"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  disabled,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200/60">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
          placeholder-white/20 focus:outline-none focus:border-orange-400/60 transition-all
          duration-200 disabled:opacity-40 disabled:cursor-not-allowed w-full"
      />
      {hint && <p className="text-[10px] text-white/30 pl-1">{hint}</p>}
    </div>
  );
}

function SaveButton({
  loading,
  saved,
  label = "Save Changes",
}: {
  loading: boolean;
  saved: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest
        transition-all duration-300 active:scale-95 shadow-lg
        ${saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-400 text-white"}
        ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {loading ? "Saving…" : saved ? "✓ Saved!" : label}
    </button>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-orange-200">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0
        ${checked ? "bg-orange-500" : "bg-white/10 border border-white/20"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md
          transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────
function AvatarSection({ user }: { user: User }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    setUploading(true);
    // TODO: POST /api/user/avatar with FormData
    await new Promise((r) => setTimeout(r, 1200));
    setUploading(false);
    setUploaded(true);
    setTimeout(() => setUploaded(false), 2500);
  }

  const src = preview ?? user?.image ?? null;

  return (
    <Section icon="🖼️" title="Profile Picture">
      <div className="flex items-center gap-5">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
            {src ? (
              <Image
                src={src}
                alt="avatar"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white"
          >
            Change
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/40">JPG, PNG or GIF · max 2 MB</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 hover:border-orange-400 hover:text-orange-300 transition-all"
            >
              Choose
            </button>
            {preview && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-400 text-white transition-all disabled:opacity-50"
              >
                {uploading ? "Uploading…" : uploaded ? "✓ Done!" : "Upload"}
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </Section>
  );
}

function PersonalInfoSection({ user }: { user: User }) {
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    // TODO: PATCH /api/user/profile  { name }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Section icon="✏️" title="Personal Information">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Display Name"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <Field
          label="Email Address"
          type="email"
          value={user?.email ?? ""}
          disabled
          hint="Email changes require verification — contact support."
        />
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} saved={saved} />
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
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
    // TODO: POST /api/user/change-password  { current, next }
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSaved(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTimeout(() => setSaved(false), 2500);
  }

  const strength =
    next.length === 0 ? 0 : next.length < 6 ? 1 : next.length < 10 ? 2 : 3;

  return (
    <Section icon="🔒" title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Current Password"
          type="password"
          value={current}
          onChange={setCurrent}
          placeholder="••••••••"
        />
        <Field
          label="New Password"
          type="password"
          value={next}
          onChange={setNext}
          placeholder="Min 8 characters"
        />

        {next.length > 0 && (
          <div className="flex items-center gap-3 -mt-1">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${["", "bg-red-500", "bg-yellow-400", "bg-green-500"][strength]}`}
                style={{ width: `${(strength / 3) * 100}%` }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-black text-white/40">
              {["", "Weak", "Good", "Strong"][strength]}
            </span>
          </div>
        )}

        <Field
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat new password"
        />

        {error && <p className="text-xs text-red-400 pl-1">{error}</p>}

        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} saved={saved} label="Update Password" />
        </div>
      </form>
    </Section>
  );
}

const NOTIF_ITEMS = [
  { key: "orders",    label: "Order Updates",     desc: "Status changes for your active orders" },
  { key: "promos",    label: "Promotions & Deals", desc: "Seasonal offers and loyalty rewards" },
  { key: "news",      label: "Cozy Cup News",      desc: "New menu items and announcements" },
  { key: "reminders", label: "Daily Reminders",    desc: "Your morning coffee nudge ☕" },
] as const;

type NotifKey = (typeof NOTIF_ITEMS)[number]["key"];

function NotificationsSection() {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    orders: true,
    promos: false,
    news: true,
    reminders: false,
  });
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: PATCH /api/user/notifications  { prefs }
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Section icon="🔔" title="Notifications">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col divide-y divide-white/5">
          {NOTIF_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 gap-4">
              <div>
                <p className="text-sm font-semibold text-white/80">{item.label}</p>
                <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                checked={prefs[item.key]}
                onChange={() =>
                  setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                }
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <SaveButton loading={false} saved={saved} label="Save Preferences" />
        </div>
      </form>
    </Section>
  );
}

function DangerZone() {
  const [confirm, setConfirm] = useState(false);

  return (
    <Section icon="⚠️" title="Danger Zone">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-red-400">Delete Account</p>
          <p className="text-[11px] text-white/30 mt-1 max-w-[200px]">
            Permanently removes your account and all data. Cannot be undone.
          </p>
        </div>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-2 items-end">
            <p className="text-[10px] text-red-400 font-bold">Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 hover:border-white/40 transition-all"
              >
                Cancel
              </button>
              <button
                // TODO: call your delete-account API here
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function ProfileDrawer() {
  const { data: session, status } = useSession(); // ← fetch session client-side
  const [open, setOpen] = useState(false);

  const user = session?.user;

  return (
    <>
      {/* Trigger — avatar button */}
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/20 hover:border-orange-400 transition-all duration-200 bg-white/10 flex items-center justify-center"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt="avatar"
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-lg">👤</span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[201] h-full w-full max-w-md bg-orange-950 border-l border-white/10
          shadow-[-20px_0_60px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10 shrink-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shrink-0">
            {user?.image ? (
              <Image
                src={user.image}
                alt="avatar"
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif italic text-lg leading-none truncate">
              {status === "loading" ? "Loading…" : user?.name ?? "Your Profile"}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 mt-1 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        {status === "loading" ? (
          <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
            Loading profile…
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
            {user && <AvatarSection user={user} />}
            {user && <PersonalInfoSection user={user} />}
            <PasswordSection />
            <NotificationsSection />
            <DangerZone />

            {/* Sign out */}
            <button
              onClick={() => signOut()}
              className="w-full py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}