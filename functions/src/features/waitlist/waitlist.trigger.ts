import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { resendApiKey } from "../../config/env";
import * as waitlistService from "./waitlist.service";

const REGION = "europe-west3";

export const onWaitlistRequestCreated = onDocumentCreated(
  { region: REGION, document: "betaRequests/{requestId}", secrets: [resendApiKey] },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    if (!data || typeof data.email !== "string") {
      logger.error("Invalid waitlist request data", data);
      return;
    }

    try {
      await waitlistService.sendWaitlistConfirmation(
        { email: data.email, name: data.name },
        snapshot.ref.path,
      );
    } catch (error) {
      logger.error("Error processing waitlist request", error);
    }
  },
);
