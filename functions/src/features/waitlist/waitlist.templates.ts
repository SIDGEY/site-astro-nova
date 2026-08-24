// Template HTML pour l'email de confirmation d'inscription à la liste d'attente.
export const getWaitlistConfirmationTemplate = (userName?: string): string => {
  const greeting = userName ? `Bonjour ${userName},` : "Bonjour,";
  const currentYear = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation d'inscription à la liste d'attente Dynasty Nova</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #F8FAFC; background-color: #0F172A; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1E293B; border-radius: 8px; border: 1px solid #334155;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
        <div style="margin-bottom: 20px; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">
          DYNASTY NOVA
        </div>
        <h1 style="color: #F8FAFC; margin-top: 0; font-size: 24px;">Confirmation d'inscription à la liste d'attente</h1>
      </div>

      <div style="padding: 20px 0; color: #F8FAFC;">
        <p style="color: #F8FAFC;">${greeting}</p>
        <p style="background-color: #f8f9fa; color: #475569; border: 1px dashed #94a3b8; padding: 8px 12px; border-radius: 4px; font-size: 0.9em; margin: 10px 0 20px;">Pour ne pas manquer nos prochains emails, veuillez ajouter <strong>support@dynastynova.com</strong> à vos contacts.</p>
        <p style="color: #F8FAFC;"><strong>Bonne nouvelle :</strong> votre inscription à la liste d'attente de Dynasty Nova a bien été prise en compte !</p>

        <div style="background-color: #0F172A; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; border: 1px solid #334155;">
          <p style="font-weight: bold; color: #3B82F6;">Votre demande a été enregistrée avec succès</p>
          <p style="color: #F8FAFC;">Nous vous recontacterons par email dès qu'une place se libère.</p>
        </div>

        <p style="color: #F8FAFC;">Nous avons hâte de vous voir explorer notre univers et faire partie des premiers à tester cette expérience exclusive.</p>

        <p style="color: #F8FAFC;">En attendant, voici quelques actions que vous pouvez faire pour ne rien manquer :</p>

        <div style="background-color: #0F172A; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; border: 1px solid #334155;">
          <p style="color: #F8FAFC;"><span style="font-weight: bold; color: #3B82F6;">✅</span> Suivez-nous sur <a href="https://twitter.com/dynastynova" style="color: #3B82F6; text-decoration: underline;">X (Twitter)</a> pour les dernières actualités</p>
          <p style="color: #F8FAFC;"><span style="font-weight: bold; color: #3B82F6;">✅</span> Rejoignez notre <a href="https://discord.gg/dynastynova" style="color: #3B82F6; text-decoration: underline;">Discord</a> pour échanger avec la communauté</p>
          <p style="color: #F8FAFC;"><span style="font-weight: bold; color: #3B82F6;">✅</span> Vérifiez régulièrement votre boîte mail (et le dossier spam)</p>
        </div>

        <p style="color: #F8FAFC;">Merci pour votre enthousiasme et votre soutien. À très bientôt dans les étoiles !</p>

        <p style="color: #F8FAFC;">L'équipe Dynasty Nova</p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #334155; font-size: 0.8em; color: #94A3B8;">
        <p style="color: #94A3B8;">Dynasty Nova - Tous droits réservés © ${currentYear}</p>
        <p style="color: #94A3B8;">Cet email a été envoyé car vous vous êtes inscrit à la liste d'attente de Dynasty Nova.</p>
        <div style="margin-top: 15px;">
          <a href="https://twitter.com/dynastynova" style="margin: 0 10px; color: #94A3B8; text-decoration: none;">X (Twitter)</a> | <a href="https://discord.gg/dynastynova" style="margin: 0 10px; color: #94A3B8; text-decoration: none;">Discord</a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};
