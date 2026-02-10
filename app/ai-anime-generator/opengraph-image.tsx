import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          fontSize: 54,
          fontWeight: 800,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.85 }}>
          ALLHFA • US & EU • 18+ only
        </div>
        <div style={{ marginTop: 18, lineHeight: 1.05 }}>
          AI Anime Generator
        </div>
        <div style={{ marginTop: 18, fontSize: 28, fontWeight: 600, opacity: 0.85 }}>
          Create anime images from text prompts
        </div>
      </div>
    ),
    size
  );
}
