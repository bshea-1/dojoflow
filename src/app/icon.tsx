import { ImageResponse } from "next/og";

// Generate the app icon (used for /icon and /favicon.ico) at build/runtime.
// This runs on the server – do NOT mark it as "use client".

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background: "linear-gradient(135deg, #1d4ed8, #38bdf8)",
          fontSize: 32,
          fontWeight: 800,
          color: "#e5e7eb",
          letterSpacing: "-0.08em",
        }}
      >
        DF
      </div>
    ),
    size
  );
}



