"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Admin: talant rasmi / kompaniya logosi yuklash. /api/upload'ga cookie bilan
 * yuboradi (same-origin) va entity photo_url/logo_url'ini saqlaydi.
 */
export function ImageUpload({
  kind,
  id,
  initialUrl = null,
  size = 72,
}: {
  kind: "avatar" | "logo";
  id: string;
  initialUrl?: string | null;
  size?: number;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("PNG, JPG yoki WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Rasm 6MB dan katta");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("read"));
        r.readAsDataURL(file);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl, kind, id }),
      });
      if (!res.ok) {
        setError("Yuklab bo'lmadi");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) setUrl(`${data.url}?t=${Date.now()}`);
    } catch {
      setError("Xatolik");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        style={{ width: size, height: size }}
        className={`relative grid place-items-center overflow-hidden border border-line bg-surface-2 transition-colors hover:border-orange disabled:opacity-60 ${
          kind === "avatar" ? "rounded-full" : "rounded-card"
        }`}
        title="Rasm yuklash"
      >
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[26px] font-light text-ink-faint">+</span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-ink/55 py-0.5 text-center text-[10px] font-semibold text-white">
          {busy ? "…" : url ? "O'zg." : "Yuklash"}
        </span>
      </button>
      {error ? (
        <span className="text-[11px] font-semibold text-red-ink">{error}</span>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFile}
        hidden
      />
    </div>
  );
}
