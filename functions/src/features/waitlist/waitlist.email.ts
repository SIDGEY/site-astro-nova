import { Resend } from "resend";
import { getWaitlistConfirmationTemplate } from "./waitlist.templates";
import { getConfig } from "../../config/env";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = getConfig().resend.apiKey;
    if (!apiKey) throw new Error("RESEND_API_KEY_MISSING");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendWaitlistConfirmationEmail(
  email: string,
  userName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getConfig();
    const resend = getResendClient();
    const from = `Dynasty Nova <${config.resend.fromEmail}>`;
    const html = getWaitlistConfirmationTemplate(userName);

    const response = await resend.emails.send({
      from,
      to: email,
      subject: "Confirmation de votre inscription à la liste d'attente Dynasty Nova",
      html,
      replyTo: config.resend.fromEmail,
    });

    if (response.error) throw new Error(response.error.message);
    return { success: true };
  } catch (error) {
    console.error("Error sending waitlist confirmation email", error);
    return { success: false, error: (error as Error).message };
  }
}
