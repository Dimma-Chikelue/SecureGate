import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Fallback email sender if domain isn't custom verified
const sender = "SecureGate <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/verify-email/${token}`;

  await resend.emails.send({
    from: sender,
    to: email,
    subject: "Verify your secure vault access",
    html: `
      <div style="background-color: #0c0f17; color: #f3f4f6; font-family: sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #2563eb; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">SecureGate Client Vault</h2>
        <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px; color: #cbd5e1;">You requested access to the premium client art vault. To verify your identity, please click the button below:</p>
        <div style="margin-bottom: 32px;">
          <a href="${confirmLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Identity</a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">This link will expire in 15 minutes.</p>
        <p style="font-size: 12px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${domain}/reset-password/${token}`;

  await resend.emails.send({
    from: sender,
    to: email,
    subject: "Reset your vault credentials",
    html: `
      <div style="background-color: #0c0f17; color: #f3f4f6; font-family: sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #dc2626; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">SecureGate Client Vault</h2>
        <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px; color: #cbd5e1;">A request was made to reset the credentials for your art vault access. Click the link below to verify your request and establish a new password:</p>
        <div style="margin-bottom: 32px;">
          <a href="${resetLink}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Credentials</a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">This link will expire in 1 hour.</p>
        <p style="font-size: 12px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px;">If you did not make this request, your account remains secure and no action is required.</p>
      </div>
    `
  });
}
