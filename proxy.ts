import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface AuthRequest extends NextRequest {
  auth: any;
}

export default auth((req: AuthRequest) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;

  // 1. Protect Admin Routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || userRole !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // 2. Protect Order Routes
  if (nextUrl.pathname.startsWith("/orders")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/api/auth/signin", nextUrl));
    }
  }

  // 3. Protect Staff Routes
  if (nextUrl.pathname.startsWith("/staff")) {
    if (!isLoggedIn || userRole !== "staff") {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};