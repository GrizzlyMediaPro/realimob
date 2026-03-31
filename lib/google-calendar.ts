import { google } from "googleapis";
import { prisma } from "./prisma";

export function getGoogleOAuthRedirectUri(): string {
  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/api/agent/google-calendar/callback`;
}

export function createGoogleOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID si GOOGLE_CLIENT_SECRET lipsesc.");
  }
  return new google.auth.OAuth2(clientId, clientSecret, getGoogleOAuthRedirectUri());
}

/** Scope-uri OAuth: profil + email + creare evenimente în Calendar */
export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

export async function exchangeCodeForTokens(code: string) {
  const client = createGoogleOAuth2Client();
  const { tokens } = await client.getToken(code);
  return { tokens, oauth2Client: client };
}

export function getCalendarClientFromRefreshToken(refreshToken: string) {
  const oauth2 = createGoogleOAuth2Client();
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: oauth2 });
}

export async function createPrimaryCalendarEventForAgentEmail(
  clerkEmail: string,
  body: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    attendeeEmails?: string[];
  }
) {
  const agent = await prisma.agent.findFirst({
    where: { email: clerkEmail },
    select: { id: true, googleRefreshToken: true },
  });
  if (!agent?.googleRefreshToken) {
    throw new Error("Agentul nu are Google Calendar conectat.");
  }
  const calendar = getCalendarClientFromRefreshToken(agent.googleRefreshToken);
  const { data } = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: body.summary,
      description: body.description,
      start: {
        dateTime: body.start.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      end: {
        dateTime: body.end.toISOString(),
        timeZone: "Europe/Bucharest",
      },
      attendees: body.attendeeEmails?.map((email) => ({ email })),
    },
  });
  return data;
}
