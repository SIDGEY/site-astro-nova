/**
 * Envoi de la prospection créateurs depuis Gmail, un mail personnalisé par chaîne.
 *
 * Installation (une fois) :
 * 1. Google Sheets : nouveau classeur, Fichier → Importer → cibles.csv, séparateur « Point-virgule ».
 *    Renommer l'onglet « cibles ».
 * 2. Extensions → Apps Script, coller ce fichier, enregistrer.
 * 3. Lancer `testerSurMoi` : autoriser l'accès Gmail, vérifier le mail reçu.
 * 4. Lancer `envoyerLot` à la main, ou Déclencheurs → `envoyerLot`, chaque jour vers 10 h.
 *
 * Seules les lignes « à contacter » avec un email partent. Pour les autres, coller l'email trouvé
 * (onglet À propos de la chaîne) dans la colonne `email` : il partira au lot suivant.
 * Nouvelles lignes : `npm run youtube:creators -- --exclure cibles.csv` (Fichier → Importer →
 * Ajouter à la feuille actuelle). E-mails manquants : `npm run cibles:emails -- cibles.csv`.
 *
 * Un mail revenu en erreur (adresse invalide) passe en « rebond » au lieu de « a répondu ».
 */

const ONGLET = "cibles";
const PAR_LOT = 15;              // Gmail perso : 100 destinataires par jour au plus via Apps Script
const NOM_EXPEDITEUR = "Guillaume · Dynasty Nova";
const RELANCE_APRES_JOURS = 7;
const MESSAGE_RELANCE =
  "Salut,\n\nJe me permets une petite relance sur mon message ci-dessous, au cas où il serait passé à la trappe. " +
  "Si ce n'est pas pour toi, aucun souci, je ne relancerai plus.\n\nGuillaume\nDynasty Nova · hambourger.guillaume@gmail.com";
const REBOND = /mailer-daemon|postmaster|mail delivery/i;

function feuille_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(ONGLET);
  const data = sh.getDataRange().getValues();
  const col = Object.fromEntries(data[0].map((h, i) => [String(h).trim(), i]));
  return { sh, data, col };
}

function premierEmail_(cellule) {
  return String(cellule).split(/[\s,;]+/).find(e => /^[^@\s]+@[^@\s]+\.\w+$/.test(e)) || "";
}

/** Envoie la première ligne « à contacter » à soi-même, sans rien marquer. */
function testerSurMoi() {
  const { data, col } = feuille_();
  const ligne = data.slice(1).find(r => r[col["statut"]] === "à contacter");
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "[TEST] " + ligne[col["objet"]], ligne[col["message"]], { name: NOM_EXPEDITEUR });
}

/** Envoie au plus PAR_LOT mails dans l'ordre de la feuille (trier la feuille pour changer la priorité). */
function envoyerLot() {
  const { sh, data, col } = feuille_();
  let envoyes = 0;
  for (let i = 1; i < data.length && envoyes < PAR_LOT; i++) {
    const r = data[i];
    const email = premierEmail_(r[col["email"]]);
    if (r[col["statut"]] !== "à contacter" || !email) continue;
    GmailApp.sendEmail(email, r[col["objet"]], r[col["message"]], { name: NOM_EXPEDITEUR });
    sh.getRange(i + 1, col["statut"] + 1).setValue("envoyé");
    sh.getRange(i + 1, col["envoyé le"] + 1).setValue(new Date());
    envoyes++;
    Utilities.sleep(20000);      // 20 s entre deux mails : un rythme humain
  }
  Logger.log(envoyes + " mail(s) envoyé(s)");
  noterReponses();
}

/** Repère les fils où le créateur a répondu, et relance une fois ceux restés muets. */
function noterReponses() {
  const { sh, data, col } = feuille_();
  const moi = Session.getActiveUser().getEmail().toLowerCase();
  const limite = new Date(Date.now() - RELANCE_APRES_JOURS * 864e5);
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    const email = premierEmail_(r[col["email"]]);
    if (!email || !["envoyé", "relancé"].includes(r[col["statut"]])) continue;
    const fils = GmailApp.search(`to:${email} subject:"${r[col["objet"]]}"`, 0, 1)[0];
    if (!fils) continue;
    const autres = fils.getMessages().filter(m => !m.getFrom().toLowerCase().includes(moi));
    if (autres.some(m => REBOND.test(m.getFrom()))) {
      // Adresse invalide : ni réponse ni relance. Corriger l'email et repasser « à contacter ».
      sh.getRange(i + 1, col["statut"] + 1).setValue("rebond");
    } else if (autres.length) {
      sh.getRange(i + 1, col["statut"] + 1).setValue("a répondu");
      sh.getRange(i + 1, col["réponse"] + 1).setValue("oui, voir Gmail");
    } else if (r[col["statut"]] === "envoyé" && r[col["envoyé le"]] && new Date(r[col["envoyé le"]]) < limite) {
      const cite = String(r[col["message"]]).split("\n").map(l => "> " + l).join("\n");
      GmailApp.sendEmail(email, "Re: " + r[col["objet"]], MESSAGE_RELANCE + "\n\n" + cite, { name: NOM_EXPEDITEUR });
      sh.getRange(i + 1, col["statut"] + 1).setValue("relancé");
      sh.getRange(i + 1, col["relancé le"] + 1).setValue(new Date());
    }
  }
}
