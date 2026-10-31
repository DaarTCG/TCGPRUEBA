import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { buildCsp } from "@/lib/csp";
import { CSRF_COOKIE } from "@/lib/csrf";

function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Control de acceso por rol ──
  const needsAuth = pathname.startsWith("/cuenta") || pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (needsAuth) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && token.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Prohibido" }, { status: 403 });
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── CSP con nonce ──
  const nonce = btoa(randomToken(16));
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);

  // ── Cookie CSRF (double-submit) ──
  if (!req.cookies.get(CSRF_COOKIE)) {
    res.cookies.set(CSRF_COOKIE, randomToken(32), {
      httpOnly: false, // el cliente debe leerla para reenviarla en el header
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
