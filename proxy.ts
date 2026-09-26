import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";
import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!accessToken && refreshToken) {
    try {
      const response = await checkSession();
      const setCookie = response.headers["set-cookie"];

      if (response.data.success && setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
        const nextResponse = isPublicRoute
          ? NextResponse.redirect(new URL("/profile", request.url))
          : NextResponse.next();

        for (const cookieStr of cookieArray) {
          const { name, value, ...options } = parseSetCookie(cookieStr);
          if (value) {
            nextResponse.cookies.set(name, value, options);
          }
        }

        return nextResponse;
      }
    } catch {
      // Session could not be refreshed, treat the user as unauthenticated
    }
  }

  const isAuthenticated = Boolean(accessToken);

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
