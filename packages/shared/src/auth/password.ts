// argon2 (native .node) — FAQAT shu modul import qiladi.
// Barrel (@talantly/shared) buni RE-EXPORT QILMAYDI — aks holda har bir
// Next app (hr/web) webpack'da ".node" binarni bundle qilib yiqiladi.
// Faqat webapp login route + bot bu subpath'ni ("@talantly/shared/auth/password")
// import qiladi (Node runtime).
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";

/** argon2id hash. Ochiq parol hech qayerda saqlanmaydi — faqat hash. */
export function hashPassword(password: string): Promise<string> {
  return argonHash(password);
}

/** Saqlangan hash'ga parolni solishtiradi. Xato bo'lsa false. */
export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argonVerify(hash, password);
  } catch {
    return false;
  }
}
