import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StaffHomePage() {
  const session = await auth();

  console.log("SESSION:", session); // ✅ DEBUG HERE

  if (!session) redirect("/login");
  if (session.user?.role !== "staff") redirect("/403");

  // ✅ Improved fallback (handles "", null, undefined)
  const name =
    session.user?.name?.trim() ||
    session.user?.email?.split("@")[0] ||
    "Staff Member";

  const role = session.user?.role ?? "staff";
  const email = session.user?.email ?? "—";
  const id = session.user?.id ?? "—";
  const image = session.user?.image;

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        .playfair { font-family: 'Playfair Display', serif; }
        .dmsans   { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <main
        className="dmsans min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "#FAF6EF" }}
      >
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{ border: "1px solid #DED0BC", background: "#fff" }}
        >
          {/* ── Banner ── */}
          <div
            className="flex flex-col items-center py-10 px-6 gap-4"
            style={{
              background:
                "linear-gradient(135deg, #2C1A0E 0%, #6B3F1F 100%)",
            }}
          >
            {/* Avatar */}
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: "3px solid #C49A6C" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold"
                style={{ background: "#C49A6C", color: "#2C1A0E" }}
              >
                {initials}
              </div>
            )}

            <div className="text-center">
              <p
                className="text-xs tracking-widest mb-1"
                style={{ color: "#C49A6C" }}
              >
                WELCOME BACK
              </p>
              <h1
                className="playfair text-2xl font-semibold leading-tight"
                style={{ color: "#fff" }}
              >
                {name}
              </h1>
            </div>

            <span
              className="px-4 py-1 rounded-full text-xs font-medium capitalize"
              style={{
                background: "rgba(196,154,108,0.2)",
                color: "#C49A6C",
                border: "1px solid rgba(196,154,108,0.35)",
              }}
            >
              {role}
            </span>
          </div>

          {/* ── Info rows ── */}
          <div className="px-6 py-6 flex flex-col gap-3">
            <InfoRow label="Full name" value={name} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Role" value={role} capitalize />
            <InfoRow label="Staff ID" value={id} mono />
          </div>

          {/* ── Footer ── */}
          <div
            className="px-6 py-4 text-center text-xs"
            style={{
              background: "#FAF6EF",
              borderTop: "1px solid #DED0BC",
              color: "#7A5F4A",
            }}
          >
            ☕ BrewDesk Staff Portal
          </div>
        </div>
      </main>
    </>
  );
}

function InfoRow({
  label,
  value,
  capitalize,
  mono,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: "#FAF6EF", border: "1px solid #DED0BC" }}
    >
      <span className="text-xs font-medium" style={{ color: "#7A5F4A" }}>
        {label}
      </span>
      <span
        className={`text-sm font-medium truncate max-w-[60%] text-right ${
          capitalize ? "capitalize" : ""
        }`}
        style={{
          color: "#1E1209",
          fontFamily: mono ? "monospace" : undefined,
          fontSize: mono ? 12 : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}