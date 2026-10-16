/**
 * PostHog : le chaînon que GA4 et GSC ne donnent pas, la conversion par page. GSC dit
 * quelle requête amène sur quelle page, GA4 combien de vues, PostHog quelle page fait
 * partir vers le jeu (`play_click`), jusqu'où on la lit et où l'on bute (rage clicks,
 * replays, heatmaps). Lu par `scripts/posthog-fetch.mjs`.
 *
 * La clé projet (phc_…) est publique par nature, comme le Measurement ID GA4 du layout.
 * Vide : rien n'est chargé, le site tourne comme avant.
 */
import type { PostHog } from "posthog-js";

const POSTHOG_KEY = "phc_vwC4MWEfdmFWdXwLnzUTNvni44HJXDb5Bq5i76siRRUn";
const POSTHOG_HOST = "https://eu.i.posthog.com";

let loading: Promise<PostHog | null> | null = null;

// Import dynamique : la librairie (~300 Ko) part dans son propre fichier, chargé après la
// page, au lieu d'alourdir le script commun de chaque page (Core Web Vitals, donc SEO).
export const loadPosthog = (): Promise<PostHog | null> => {
  if (typeof window === "undefined" || !POSTHOG_KEY) return Promise.resolve(null);
  loading ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        defaults: "2026-08-30",
        // Profils créés seulement à l'identification (côté jeu, à l'inscription) : les
        // visiteurs anonymes restent entièrement analysables sans gonfler la facture.
        person_profiles: "identified_only",
        // Cookie posé sur .dynastynova.com : si le jeu (play.dynastynova.com) envoie dans le
        // même projet, le visiteur garde son identifiant et le parcours article -> inscription
        // se lit d'un bout à l'autre.
        cross_subdomain_cookie: true,
        capture_pageleave: true,
        enable_heatmaps: true,
        capture_dead_clicks: true,
        capture_exceptions: true,
        capture_performance: { web_vitals: true },
        session_recording: { maskAllInputs: true },
      });
      return posthog;
    })
    .catch(() => null); // Bloqueur de pub, réseau : le site continue sans.
  return loading;
};

loadPosthog();
