import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getDb } from "@/lib/server/db";
import { ensureTalent } from "@/lib/server/talents";
import { ensureCompany } from "@/lib/server/companies";

export const dynamic = "force-dynamic";

const BUCKET = "public-media";
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/**
 * POST { image: dataUrl, kind: "avatar" | "logo" }
 * Rasmni public bucketга yuklaydi va egasining photo_url/logo_url'ini saqlaydi.
 * kind=avatar → o'z talant profili; kind=logo → o'z kompaniyasi.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  let body: { image?: unknown; kind?: unknown };
  try {
    body = (await req.json()) as { image?: unknown; kind?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const kind = body.kind === "logo" ? "logo" : "avatar";
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

  const db = getDb();
  let table: "talents" | "companies";
  let column: "photo_url" | "logo_url";
  let id: string;
  let folder: string;

  if (kind === "logo") {
    const company = await ensureCompany(g.session);
    table = "companies";
    column = "logo_url";
    id = company.id;
    folder = "logos";
  } else {
    const talent = await ensureTalent(g.session);
    table = "talents";
    column = "photo_url";
    id = talent.id;
    folder = "avatars";
  }

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
