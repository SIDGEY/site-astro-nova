/**
 * Système de tracking privacy-first minimal.
 * En développement : affiche dans la console et stocke en local.
 * En production : les événements remontent aussi dans GA4 via gtag
 * (voir le tag dans BaseLayout.astro) et dans PostHog (voir lib/posthog.ts).
 */

import { loadPosthog } from "./posthog";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, props: Record<string, any> = {}) => {
  const timestamp = new Date().toISOString();
  const eventData = {
    event: eventName,
    properties: props,
    timestamp,
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  // Log en console pour le dev
  console.log(`[Tracking] ${eventName}`, eventData);

  // Stockage local pour preuve de concept (privacy-first, pas de cookies)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const history = JSON.parse(localStorage.getItem('atecna_events') || '[]');
      history.push(eventData);
      // On garde les 50 derniers événements
      localStorage.setItem('atecna_events', JSON.stringify(history.slice(-50)));
    } catch (e) {
      console.error('Failed to save event to localStorage', e);
    }
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, props);
  }

  // transport_type est la consigne gtag ; son équivalent PostHog passe en option d'envoi.
  const { transport_type, ...properties } = props;
  loadPosthog().then((posthog) =>
    posthog?.capture(
      eventName,
      properties,
      transport_type === "beacon" ? { transport: "sendBeacon" } : undefined,
    ),
  );
};
