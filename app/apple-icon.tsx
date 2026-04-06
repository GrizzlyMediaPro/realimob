import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const fontData = await readFile(
    path.join(process.cwd(), "public/fonts/Kursk105-Medium.otf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E6EAEF",
          color: "#1B1920",
          fontSize: 124,
          fontFamily: "Kursk105",
          letterSpacing: "-0.04em",
        }}
      >
        r
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Kursk105",
          data: fontData,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
