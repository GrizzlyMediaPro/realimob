import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function isClerkAgentSuspended(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const s = (user.publicMetadata as { agentStatus?: string } | undefined)
    ?.agentStatus;
  return s === "suspended";
}

export function agentSuspendedApiResponse() {
  return NextResponse.json(
    {
      error:
        "Contul de agent este suspendat: ai chestionare după vizionări necompletate în termen. Completează chestionarele din notificări pentru a reactiva contul sau contactează administratorul.",
      code: "agent_suspended",
    },
    { status: 403 },
  );
}
