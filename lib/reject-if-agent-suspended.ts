import { NextResponse } from "next/server";
import {
  agentSuspendedApiResponse,
  isClerkAgentSuspended,
} from "@/lib/agent-suspended-guard";

export async function rejectIfAgentSuspended(
  userId: string,
): Promise<NextResponse | null> {
  if (await isClerkAgentSuspended(userId)) {
    return agentSuspendedApiResponse();
  }
  return null;
}
