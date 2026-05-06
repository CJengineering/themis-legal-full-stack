import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = [
  "/dashboard",
  "/workflows",
  "/my-signatures",
  "/settings",
  "/sign",
]

const publicRoutes = [
  "/login",
  "/error",
  "/api/auth",
  "/",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for Better Auth session cookie (the cookie name is "better-auth.session_token")
    const sessionCookie = request.cookies.get("better-auth.session_token")

    if (!sessionCookie) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
