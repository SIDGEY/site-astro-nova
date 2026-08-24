import { defineSecret, defineString } from "firebase-functions/params";

export const resendApiKey = defineSecret("RESEND_API_KEY");
const resendFromEmail = defineString("RESEND_FROM_EMAIL", {
  default: "support@dynastynova.com",
});

export function getConfig() {
  return {
    resend: {
      apiKey: resendApiKey.value(),
      fromEmail: resendFromEmail.value(),
    },
  };
}
