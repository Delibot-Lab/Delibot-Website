import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${siteConfig.name} | ${siteConfig.labName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [logoData, semiBold, bold] = await Promise.all([
    readFile(path.join(process.cwd(), "public/delibot-logo.png")),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/pretendard/dist/public/static/Pretendard-SemiBold.otf"
      )
    ),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"
      )
    ),
  ]);
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
          gap: 28,
          backgroundColor: "#2c3e50",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(127,201,168,0.35), transparent 55%), radial-gradient(circle at 12% 92%, rgba(86,177,140,0.25), transparent 50%)",
        }}
      >
        <img src={logoSrc} width={140} height={140} style={{ borderRadius: 32 }} alt="" />
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontFamily: "Pretendard Bold",
            color: "#ffffff",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontFamily: "Pretendard SemiBold",
            color: "#7fc9a8",
          }}
        >
          {siteConfig.labName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontFamily: "Pretendard SemiBold",
            color: "#e6ecea",
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard SemiBold", data: semiBold, weight: 600, style: "normal" },
        { name: "Pretendard Bold", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
