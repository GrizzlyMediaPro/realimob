import { NextRequest, NextResponse } from "next/server";
import { syncCompletedViewingQuestionnaires } from "@/lib/viewing-questionnaire-sync";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  const ok =
    secret &&
    header === `Bearer ${secret}`;
  if (!ok) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const result = await syncCompletedViewingQuestionnaires();
  return NextResponse.json(result);
}
