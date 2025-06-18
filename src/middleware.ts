import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value
  const isLoggedIn = !!authToken
  const isOnAdminRoute = request.nextUrl.pathname.startsWith("/admin")

  // Check admin routes - chỉ kiểm tra có token hay không
  // Role verification sẽ được thực hiện trong admin layout
  if (isOnAdminRoute) {
    console.log('Middleware: Accessing admin route:', request.nextUrl.pathname);

    if (!isLoggedIn) {
      console.log('Middleware: No auth token, redirecting to login');
      return NextResponse.redirect(new URL("/dang-nhap", request.nextUrl))
    }

    console.log('Middleware: Has auth token, allowing access (role check in layout)');
  }

  // Redirect logged-in users away from login page
  if (isLoggedIn && request.nextUrl.pathname === "/dang-nhap") {
    console.log('Middleware: Logged in user accessing login page, redirecting to home');
    return NextResponse.redirect(new URL("/", request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}