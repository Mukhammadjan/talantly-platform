import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/session";

// Admin-only yo'llar — moderator kelsa haqiqiy 403 (UI'da yashirish yetarli emas).
const ADMIN_ONLY = [
  "/dashboard",
  "/talantlar",
  "/foydalanuvchilar",
  "/moderatorlar",
  "/moslashtirish",
  "/savollar",
  "/statistika",
  "/sozlamalar",
  "/audit",
];

function roleLanding(role: string): string {
  return role === "admin" ? "/dashboard" : "/tekshiruv";
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Tokenli ochiq share sahifalari — sessiya shart emas.
  if (pathname.startsWith("/ulashish")) return NextResponse.next();

  // API route'lar auth'ni O'ZI bajaradi (redirect emas, JSON 401/403).
  if (pathname.startsWith("/api")) return NextResponse.next();

  const secret = process.env.WEBAPP_JWT_SECRET ?? "";
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const claims = token && secret ? await verifyAdminToken(token, secret) : null;
  const isPanelUser =
    claims && (claims.role === "admin" || claims.role === "moderator");

  const isLogin = pathname.startsWith("/login");

  if (!isPanelUser) {
    if (isLogin) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Kirgan foydalanuvchi login sahifasiga bormaydi.
  if (isLogin) {
    return NextResponse.redirect(
      new URL(roleLanding(claims.role), request.url),
    );
  }

  // Admin-only yo'l + moderator → 403 (server darajasida, curl bilan ko'rinadi).
  if (
    claims.role !== "admin" &&
    ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return new NextResponse("403 — Ruxsat yo'q (faqat admin)", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
