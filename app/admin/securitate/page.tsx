import { redirect } from "next/navigation";

export default function AdminSecuritateRedirectPage() {
  redirect("/admin/setari?tab=securitate");
}
