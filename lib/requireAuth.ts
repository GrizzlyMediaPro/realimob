import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/** Pentru pagini App Router: redirecționează utilizatorii neautentificați. */
export async function requireAuthPage(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}
