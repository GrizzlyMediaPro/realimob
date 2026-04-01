import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  getGoogleOAuthRedirectUri,
  GOOGLE_OAUTH_SCOPES,
} from "@/lib/google-calendar";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "Google OAuth nu este configurat. Seteaza GOOGLE_CLIENT_ID si GOOGLE_CLIENT_SECRET in .env.",
      },
      { status: 400 }
    );
  }

  const state = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("gc_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const redirectUri = getGoogleOAuthRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
