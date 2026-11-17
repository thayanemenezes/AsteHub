import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ tenant: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { tenant } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenant)) {
    return NextResponse.json({ message: "Public site not found." }, {
      status: 404,
    });
  }

  const apiUrl =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) {
    throw new Error("API_URL must be configured for public lead submissions.");
  }

  const upstream = await fetch(
    `${apiUrl.replace(/\/+$/, "")}/public/${encodeURIComponent(tenant)}/leads`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    },
  );
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
