import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          fontSize: 22,
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
