/**
 * Système de tracking privacy-first minimal.
 * En développement : affiche dans la console et stocke en local.
 * En production : peut être branché à Plausible/Fathom.
 */

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

  // NOTE: Pour activer Plausible plus tard :
  // if (window.plausible) {
  //   window.plausible(eventName, { props });
  // }
};
