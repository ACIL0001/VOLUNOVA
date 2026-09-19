import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export const ExtractedNeedsSchema = z.object({
  title: z.string().min(3).max(120),
  category: z.enum(['Environmental', 'Humanitarian', 'Health', 'Education', 'Culture', 'Technology']),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  venue: z.string().min(2).max(120),
  suggestedHoursPerPerson: z.number().min(1).max(12).default(4),
  needs: z.array(z.object({
    roleName: z.string().min(2).max(60),
    skillTag: z.string().min(2).max(40),
    icon: z.enum(['hammer', 'camera', 'palette', 'heart', 'truck', 'code', 'users']),
    quantityNeeded: z.number().int().min(1).max(100),
    equipmentRequired: z.string().max(100).optional(),
  })).min(1).max(8),
});

export type ExtractedNeeds = z.infer<typeof ExtractedNeedsSchema>;

export async function extractMissionNeedsSecure(rawPrompt: string): Promise<ExtractedNeeds> {
  const sanitizedInput = (rawPrompt || '').slice(0, 2000).replace(/[<>{}]/g, '').trim();

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-key') {
    throw new Error('GEMINI_API_KEY non configurée. Veuillez renseigner votre clé API dans le fichier .env du backend.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const systemInstruction = `
You are the Autonomous AI Strategic Core of "VOLUNOVA" (تكاتف الذكي), an intelligent civic volunteering mobilization engine.
Analyze natural language descriptions of community volunteering initiatives (written in Algerian Arabic, standard Arabic, French, Darija, English, or mixed languages).

You must think independently and autonomously extract:
1. "title": A unique, captivating, and high-impact title crafted specifically for this exact initiative in the same language as the prompt. Do NOT use generic titles. Be creative, inspiring, and precise about the cause, action, and location.
2. "category": Choose the most appropriate operational domain among: "Environmental", "Humanitarian", "Health", "Education", "Culture", "Technology".
3. "urgency": Assess the operational priority: "low", "medium", "high", or "urgent".
4. "venue": Deduce or extract the location (Wilaya, neighborhood, facility, hospital, forest, beach, or institution).
5. "suggestedHoursPerPerson": Estimate realistic hours per volunteer session (integer between 1 and 12).
6. "needs": Deduce the specific human volunteer roles required to successfully execute this initiative. For each role provide:
   - "roleName": Descriptive title of the role (e.g. 'ممرض لسحب عينات الدم', 'غواص لجمع الشباك البلاستيكية', 'منشط تربوي للأطفال', 'سائق شاحنة لوجستية').
   - "skillTag": Concise professional skill category (e.g. 'Medical', 'Manual Labor', 'Logistics', 'Registration', 'Teaching', 'Graphic Design', 'Photography', 'Technology').
   - "icon": Most suitable visual icon from strictly: 'hammer' (physical/cleanup/construction), 'camera' (media/photo/drone), 'palette' (design/art), 'heart' (medical/care), 'truck' (logistics/driving), 'code' (IT/programming), 'users' (reception/organization/coordination).
   - "quantityNeeded": Realistic number of volunteers needed for this specific role (between 1 and 100).
   - "equipmentRequired": Any specific tools, materials, or equipment needed (or empty string if none).

Output strictly valid JSON matching this schema:
{
  "title": string,
  "category": "Environmental" | "Humanitarian" | "Health" | "Education" | "Culture" | "Technology",
  "urgency": "low" | "medium" | "high" | "urgent",
  "venue": string,
  "suggestedHoursPerPerson": number,
  "needs": [
    {
      "roleName": string,
      "skillTag": string,
      "icon": "hammer" | "camera" | "palette" | "heart" | "truck" | "code" | "users",
      "quantityNeeded": number,
      "equipmentRequired": string
    }
  ]
}
`;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Délai d'attente de l'IA dépassé (15s). Veuillez réessayer.")), 15000)
  );

  const apiPromise = model.generateContent([
    { text: systemInstruction },
    { text: `<initiative_text>\n${sanitizedInput}\n</initiative_text>` },
  ]);

  const result = await Promise.race([apiPromise, timeoutPromise]);
  const jsonText = result.response.text();
  const rawParsed = JSON.parse(jsonText);

  // Validate and normalize AI output
  const validCategories = ['Environmental', 'Humanitarian', 'Health', 'Education', 'Culture', 'Technology'] as const;
  const validUrgencies = ['low', 'medium', 'high', 'urgent'] as const;
  const validIcons = ['hammer', 'camera', 'palette', 'heart', 'truck', 'code', 'users'] as const;

  const normalizedNeeds = (Array.isArray(rawParsed.needs) ? rawParsed.needs : []).map((n: any) => {
    if (typeof n === 'string') {
      const icon = (validIcons as readonly string[]).includes(n) ? (n as any) : 'users';
      return {
        roleName: 'متطوع ميداني',
        skillTag: 'General Support',
        icon,
        quantityNeeded: 3,
      };
    }
    const iconCandidate = n.icon || 'users';
    const icon = (validIcons as readonly string[]).includes(iconCandidate) ? iconCandidate : 'users';
    return {
      roleName: String(n.roleName || n.role || n.name || 'متطوع ميداني').slice(0, 60),
      skillTag: String(n.skillTag || n.skill || 'General Support').slice(0, 40),
      icon,
      quantityNeeded: Math.max(1, Math.min(100, Number(n.quantityNeeded) || 3)),
      equipmentRequired: n.equipmentRequired ? String(n.equipmentRequired).slice(0, 100) : undefined,
    };
  });

  const normalizedPayload = {
    title: String(rawParsed.title || '').slice(0, 120).trim(),
    category: validCategories.includes(rawParsed.category) ? rawParsed.category : 'Humanitarian',
    urgency: validUrgencies.includes(rawParsed.urgency) ? rawParsed.urgency : 'medium',
    venue: String(rawParsed.venue || 'الجزائر العاصمة').slice(0, 120).trim(),
    suggestedHoursPerPerson: Math.max(1, Math.min(12, Number(rawParsed.suggestedHoursPerPerson) || 4)),
    needs: normalizedNeeds.length > 0 ? normalizedNeeds.slice(0, 8) : [
      {
        roleName: 'متطوع ميداني',
        skillTag: 'General Support',
        icon: 'users',
        quantityNeeded: 5,
      },
    ],
  };

  return ExtractedNeedsSchema.parse(normalizedPayload);
}
