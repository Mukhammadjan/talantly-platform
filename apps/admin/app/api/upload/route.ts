import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/service";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "public-media";
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/**
 * Admin/moderator: berilgan talant/kompaniyaga rasm/logo yuklaydi.
 * POST { image: dataUrl, kind: "avatar" | "logo", id }.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const claims = token
    ? await verifyAdminToken(token, serverEnv.jwtSecret)
    : null;
  if (!claims || (claims.role !== "admin" && claims.role !== "moderator")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { image?: unknown; kind?: unknown; id?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const kind = body.kind === "logo" ? "logo" : "avatar";
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const dataUrl = typeof body.image === "string" ? body.image : "";
  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!m || !m[1] || !m[2]) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image_too_large" }, { status: 413 });
  }

  const db = getServiceClient();
  const table = kind === "logo" ? "companies" : "talents";
  const column = kind === "logo" ? "logo_url" : "photo_url";
  const folder = kind === "logo" ? "logos" : "avatars";

  const path = `${folder}/${id}-${Date.now()}.${ext}`;
  const { error: upErr } = await db.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: true });
  if (upErr) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error: updErr } = await db
    .from(table)
    .update({ [column]: url })
    .eq("id", id);
  if (updErr) {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ url });
}
