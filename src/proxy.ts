import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Kulturportal"',
    },
  });
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // The share route sends real email, so it must never be open to the public.
  const isShare = /^\/api\/events\/[^/]+\/share$/.test(path);
  // Writes (POST/PATCH/PUT/DELETE) need the portal login; plain reads of the API stay open.
  const isWrite = path.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD";

  if (path.startsWith("/api/") && !isShare && !isWrite) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    if (isShare && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Mail-Versand benötigt BASIC_AUTH_USER und BASIC_AUTH_PASSWORD" },
        { status: 503 }
      );
    }
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return unauthorized();
  }

  const encoded = auth.slice("Basic ".length);
  const decoded = atob(encoded);
  const separatorIndex = decoded.indexOf(":");
  const suppliedUser = decoded.slice(0, separatorIndex);
  const suppliedPassword = decoded.slice(separatorIndex + 1);

  if (suppliedUser !== user || suppliedPassword !== password) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
