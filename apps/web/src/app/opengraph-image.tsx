import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "talantly — Tekshirilgan talantlar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF6F0",
          gap: 36,
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" fill="#2FB86B" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
          />
          <path
            d="M20 33.5 28 41.5 44 24.5"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#191512",
              letterSpacing: -2,
            }}
          >
            talantly
          </div>
          <div style={{ fontSize: 38, color: "#1F9E58", fontWeight: 600 }}>
            Tekshirilgan talantlar
          </div>
        </div>
      </div>
    ),
    size,
  );
}
