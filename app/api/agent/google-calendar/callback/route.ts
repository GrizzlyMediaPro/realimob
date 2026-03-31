import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

function redirectWithStatus(request: Request, status: string) {
  const u = new URL("/agent", request.url);
  u.searchParams.set("google_calendar", status);
  return NextResponse.redirect(u);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const err = searchParams.get("error");

  if (err) {
    return redirectWithStatus(request, "denied");
  }

  const cookieStore = await cookies();
  const saved = cookieStore.get("gc_oauth_state")?.value;
  cookieStore.delete("gc_oauth_state");

  if (!state || !saved || state !== saved) {
    return redirectWithStatus(request, "invalid_state");
  }

  const { userId } = await auth();
  if (!userId) {
    return redirectWithStatus(request, "no_session");
  }

  if (!code) {
    return redirectWithStatus(request, "no_code");
  }

  try {
    const { tokens, oauth2Client } = await exchangeCodeForTokens(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userinfo } = await oauth2.userinfo.get();
    const googleEmail = userinfo.email ?? null;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const clerkEmail = user.emailAddresses[0]?.emailAddress ?? null;

    if (!clerkEmail) {
      return redirectWithStatus(request, "no_clerk_email");
    }

    const agent = await prisma.agent.findFirst({
      where: { email: clerkEmail },
    });
    if (!agent) {
      return redirectWithStatus(request, "no_agent");
    }

    const refreshToken =
      tokens.refresh_token ?? agent.googleRefreshToken ?? null;
    if (!refreshToken) {
      return redirectWithStatus(request, "no_refresh_token");
    }

    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        googleRefreshToken: refreshToken,
        googleCalendarEmail: googleEmail,
        googleCalendarConnectedAt: new Date(),
      },
    });

    return redirectWithStatus(request, "connected");
  } catch (error) {
    console.error("google calendar callback", error);
    return redirectWithStatus(request, "error");
  }
}
