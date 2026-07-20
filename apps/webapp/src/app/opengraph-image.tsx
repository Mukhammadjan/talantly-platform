import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Talantly — tekshirilgan talantlar platformasi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Havola Telegram/ijtimoiy tarmoqlarda ulashilganda ko'rinadigan rasm.
// Brend ranglari tokenlardan emas, bu yerda qattiq yoziladi — ImageResponse
// CSS o'zgaruvchilarini o'qiy olmaydi.
export default function OgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#F5F5F7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#F26430",
            }}
          />
          <div style={{ fontSize: 44, fontWeight: 700, color: "#17171B" }}>
            Talantly
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#17171B",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Tajribasiz emas —</span>
          <span style={{ color: "#1F9E58" }}>tekshirilgan</span>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            lineHeight: 1.4,
            color: "#6C6C76",
            maxWidth: 900,
          }}
        >
          Bilim testi va jonli suhbatdan o&apos;tgan yosh mutaxassislar.
          O&apos;zbekistondagi amaliyot platformasi.
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 26,
            fontWeight: 600,
            color: "#F26430",
          }}
        >
          talantly.uz
        </div>
      </div>
    ),
    size,
  );
}
