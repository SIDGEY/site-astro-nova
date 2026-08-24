import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../shared/database";

const COLLECTION = "betaRequests";

export async function hasConfirmationBeenSent(email: string): Promise<boolean> {
  const snapshot = await db
    .collection(COLLECTION)
    .where("email", "==", email)
    .where("registrationEmailSent", "==", true)
    .limit(1)
    .get();
  return !snapshot.empty;
}

export async function markProcessing(docPath: string): Promise<void> {
  await db.doc(docPath).update({
    processingEmail: true,
    processingStartedAt: FieldValue.serverTimestamp(),
  });
}

export async function markRegistrationEmailSent(docPath: string): Promise<void> {
  await db.doc(docPath).update({
    processingEmail: false,
    registrationEmailSent: true,
    registrationEmailSentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markRegistrationEmailFailed(docPath: string, error: string): Promise<void> {
  await db.doc(docPath).update({
    processingEmail: false,
    registrationEmailSent: false,
    emailError: error,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markDuplicateRequest(docPath: string): Promise<void> {
  await db.doc(docPath).update({
    registrationEmailSent: true,
    registrationEmailSentAt: FieldValue.serverTimestamp(),
    emailNote: "Email non envoyé car une confirmation a déjà été envoyée à cette adresse",
    updatedAt: FieldValue.serverTimestamp(),
  });
}
