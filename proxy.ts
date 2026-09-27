import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    if (request.nextUrl.pathname !== "/dashboard") {
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/patients",
    "/patients/:path*",
    "/appointments",
    "/appointments/:path*",
    "/prescriptions",
    "/prescriptions/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
