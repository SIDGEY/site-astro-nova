import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const leadSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  role: z.string().min(2),
  need: z.enum(['genai', 'data-eng', 'predictive', 'audit', 'autre']),
  message: z.string().optional(),
  consent: z.any(), // checked by client, but present in form
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validation serveur avec Zod
    const validatedData = leadSchema.parse(data);
    
    // Ajout métadonnées
    const lead = {
      ...validatedData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'local',
    };

    // Simulation de stockage local (mode dev/demo)
    const filePath = path.join(process.cwd(), 'data', 'leads.json');
    
    let existingLeads = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingLeads = JSON.parse(fileContent || '[]');
    } catch (e) {
      // Le fichier n'existe peut-être pas encore
    }

    existingLeads.push(lead);
    await fs.writeFile(filePath, JSON.stringify(existingLeads, null, 2));

    console.log(`[Lead Capture] Nouveau lead reçu : ${lead.email} (${lead.need})`);

    return new Response(JSON.stringify({
      message: 'Lead capturé avec succès',
      id: lead.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Lead Error]', error);
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Données invalides', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
