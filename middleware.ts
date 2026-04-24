// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;
  const { nextUrl } = req;

  // 1. Redirect logged-in users away from /login based on role
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    if (userRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    if (userRole === "staff") return NextResponse.redirect(new URL("/staff/dashboard", nextUrl));
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 2. Protect Admin Routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "admin") return NextResponse.redirect(new URL("/403", nextUrl));
  }

  // 3. Protect Order Routes
  if (nextUrl.pathname.startsWith("/orders")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 4. Protect Staff Routes
  if (nextUrl.pathname.startsWith("/staff")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "staff") return NextResponse.redirect(new URL("/403", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};