import { NextResponse } from "next/server";
import { canAccessPath, getUserRole, isPublicAppPath } from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const { response, user, isConfigured } = await updateSession(request);

  if (!isConfigured) {
    return response;
  }

  if (isPublicAppPath(pathname)) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    url.searchParams.set("error", "session_expired");
    return NextResponse.redirect(url);
  }

  const role = getUserRole(user);

  if (!canAccessPath(role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*"],
};
