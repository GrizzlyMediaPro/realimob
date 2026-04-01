import { prisma } from "@/lib/prisma";

export type EmailAudienceRole = "agent" | "client" | "admin";

/** Folosit când trimiți emailuri automate: verifică preferințele din panou. */
export async function isAudienceAllowedForTopic(
  topicId: string,
  role: EmailAudienceRole
): Promise<boolean> {
  const pref = await prisma.emailTopicPreference.findUnique({
    where: { topicId },
  });
  if (!pref) return true;

  if (role === "agent") return pref.sendToAgents;
  if (role === "client") return pref.sendToClients;
  return pref.sendToAdmins;
}
