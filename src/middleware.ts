import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const hasSessionCookie = request.cookies.has("authjs.session-token");

  if (isDashboard && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
