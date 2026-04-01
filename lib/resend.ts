import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResendClient(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY?.trim();
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

/** Acceptă EMAIL_FROM sau RESEND_FROM_EMAIL (alias folosit în unele ghiduri Resend). */
function getTransactionalEmailFrom(): string | undefined {
  const a = process.env.EMAIL_FROM?.trim();
  const b = process.env.RESEND_FROM_EMAIL?.trim();
  return a || b || undefined;
}

export function isEmailFromConfigured(): boolean {
  return Boolean(getTransactionalEmailFrom());
}

export async function sendTransactionalEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  const from = getTransactionalEmailFrom();
  if (!resend || !from) {
    throw new Error(
      "Email nu este configurat. Setează RESEND_API_KEY și EMAIL_FROM sau RESEND_FROM_EMAIL în variabile de mediu."
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
