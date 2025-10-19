import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  console.log("Middleware running for:", pathname);
  console.log("Token exists:", !!token);

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/firm-admin",
    "/super-admin",
    "/firm-lawyer",
    "/lawyer",
    "/assistant"
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing a protected route without token → redirect to login
  if (isProtectedRoute && !token) {
    console.log("Redirecting to login - no token");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page with token → redirect to dashboard
  if (pathname === "/auth/login" && token) {
    console.log("Redirecting to dashboard - already logged in");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (if you want to handle them separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};