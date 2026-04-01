import { redirect } from "next/navigation";

export default function AdminRapoarteRedirectPage() {
  redirect("/admin/statistici?tab=rapoarte");
}
