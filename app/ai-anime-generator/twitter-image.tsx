import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#000",
          color: "#fff",
          fontSize: 52,
          fontWeight: 800,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.85 }}>
          ALLHFA • AI Image Generator
        </div>
        <div style={{ marginTop: 18, lineHeight: 1.05 }}>
          AI Anime Generator (18+)
        </div>
        <div style={{ marginTop: 18, fontSize: 28, fontWeight: 600, opacity: 0.85 }}>
          Fast • Private gallery • Credits-based
        </div>
      </div>
    ),
    size
  );
}
