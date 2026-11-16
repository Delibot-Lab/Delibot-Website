import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const response = await fetch(`${process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8080"}/api/v1/applications`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: req.headers.get("cookie") ?? "" },
    body: await req.text(),
  });
  return new NextResponse(response.body, { status: response.status, headers: { "content-type": "application/json" } });
}
