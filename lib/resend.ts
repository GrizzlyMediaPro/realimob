import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResendClient(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Resend(key);
  return cached;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function isEmailFromConfigured(): boolean {
  return Boolean(process.env.EMAIL_FROM?.trim());
}

export async function sendTransactionalEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM?.trim();
  if (!resend || !from) {
    throw new Error(
      "Email nu este configurat. Setează RESEND_API_KEY și EMAIL_FROM în variabile de mediu."
    );
  }

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
