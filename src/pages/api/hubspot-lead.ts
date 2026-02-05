import type { APIRoute } from 'astro';
import { z } from 'zod';

const leadSchema = z.object({
  firstname: z.string().min(2, "Le prénom est requis"),
  lastname: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  company: z.string().min(2, "L'entreprise est requise"),
  company_size: z.string(),
  role: z.string(),
  objective: z.string(),
  message: z.string().optional(),
  hubspotFormType: z.string(),
  page_url: z.string(),
  page_title: z.string(),
  website_url: z.string().max(0).optional(), // Honeypot
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const payload = Object.fromEntries(data.entries());

    // 1. Validation Zod
    const validatedData = leadSchema.safeParse(payload);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ 
        message: "Données invalides", 
        errors: validatedData.error.flatten().fieldErrors 
      }), { status: 400 });
    }

    // 2. Vérification Honeypot
    if (validatedData.data.website_url && validatedData.data.website_url.length > 0) {
      console.warn("Honeypot triggered");
      return new Response(JSON.stringify({ message: "Succès (spam détecté)" }), { status: 200 });
    }

    const { 
      firstname, lastname, email, company, company_size, 
      role, objective, message, hubspotFormType, page_url, page_title 
    } = validatedData.data;

    // 3. Configuration HubSpot
    const portalId = import.meta.env.HUBSPOT_PORTAL_ID;
    const privateAppToken = import.meta.env.HUBSPOT_PRIVATE_APP_TOKEN;
    
    // Sélection du Form ID selon le type
    let formId = import.meta.env.HUBSPOT_FORM_ID_GENERIC;
    if (hubspotFormType === 'diagnostic') formId = import.meta.env.HUBSPOT_FORM_ID_DIAGNOSTIC;
    if (hubspotFormType === 'contact') formId = import.meta.env.HUBSPOT_FORM_ID_CONTACT;

    if (!portalId || !formId) {
      console.error("HubSpot configuration missing");
      return new Response(JSON.stringify({ message: "Erreur de configuration serveur" }), { status: 500 });
    }

    // 4. Mapping vers HubSpot
    // Note: Les noms des champs (property) doivent correspondre exactement à ceux de HubSpot
    const hubspotPayload = {
      fields: [
        { name: "firstname", value: firstname },
        { name: "lastname", value: lastname },
        { name: "email", value: email },
        { name: "company", value: company },
        { name: "company_size", value: company_size },
        { name: "jobtitle", value: role },
        { name: "ia_objective", value: objective },
        { name: "message", value: message || "" },
        { name: "lead_source", value: hubspotFormType },
        { name: "hs_context", value: JSON.stringify({
          pageUrl: page_url,
          pageName: page_title
        })}
      ],
      context: {
        pageUri: page_url,
        pageName: page_title
      }
    };

    // 5. Appel API HubSpot
    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
    
    const response = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(privateAppToken ? { 'Authorization': `Bearer ${privateAppToken}` } : {})
      },
      body: JSON.stringify(hubspotPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("HubSpot Error:", errorData);
      throw new Error("Erreur HubSpot");
    }

    // 6. Succès
    return new Response(JSON.stringify({ message: "C'est parti ! Votre demande a été transmise." }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Submission Error:", error);
    return new Response(JSON.stringify({ 
      message: "Une erreur est survenue lors de l'envoi. Veuillez nous contacter directement à contact@atecna.fr" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};