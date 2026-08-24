import * as waitlistEmail from "./waitlist.email";
import * as waitlistRepo from "./waitlist.repository";

interface WaitlistRequestData {
  email: string;
  name?: string;
}

export async function sendWaitlistConfirmation(requestData: WaitlistRequestData, refPath: string) {
  const alreadySent = await waitlistRepo.hasConfirmationBeenSent(requestData.email);
  if (alreadySent) {
    await waitlistRepo.markDuplicateRequest(refPath);
    return { success: true, duplicate: true, email: requestData.email };
  }

  await waitlistRepo.markProcessing(refPath);

  const emailResult = await waitlistEmail.sendWaitlistConfirmationEmail(requestData.email, requestData.name);
  if (emailResult.success) {
    await waitlistRepo.markRegistrationEmailSent(refPath);
    return { success: true, email: requestData.email };
  }

  await waitlistRepo.markRegistrationEmailFailed(refPath, emailResult.error ?? "Failed");
  return { success: false, email: requestData.email, error: emailResult.error };
}
