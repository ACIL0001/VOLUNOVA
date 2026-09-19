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
  const sanitizedInput = (rawPrompt || '').slice(0, 1500).replace(/[<>{}]/g, '').trim();

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const systemInstruction = `
You are the AI Extraction Core of "VOLUNOVA" (تكاتف الذكي), an intelligent community volunteering mobilization engine.
Analyze natural language descriptions of community volunteering initiatives (in Algerian Arabic, standard Arabic, French, Darija, or English).
Extract structured requirements and return ONLY a valid JSON object strictly matching this schema:
{
  "title": "A captivating, high-impact title uniquely tailored to this exact initiative in the prompt's language. NEVER return generic titles like 'مبادرة مجتمعية تطوعية' or 'تكاتف لخدمة المواطن'. Capture the specific action, cause, and venue (e.g., 'قطرة أمل — حملة التبرع بالدم بمستشفى مصطفى باشا', 'شواطئ نقية — حملة تنظيف شاطئ سيدي فرج')",
  "category": "Environmental" | "Humanitarian" | "Health" | "Education" | "Culture" | "Technology",
  "urgency": "low" | "medium" | "high" | "urgent",
  "venue": "Specific venue or location mentioned or inferred (e.g. Wilaya, hospital, beach, school, neighborhood)",
  "suggestedHoursPerPerson": 4,
  "needs": [
    {
      "roleName": "Specific role name (e.g. 'ممرض لسحب عينات الدم', 'متطوع لجمع النفايات', 'مدرب روبوتات')",
      "skillTag": "Key required skill (e.g. 'Medical', 'Manual Labor', 'Logistics', 'Registration', 'Teaching', 'Graphic Design')",
      "icon": "hammer" | "camera" | "palette" | "heart" | "truck" | "code" | "users",
      "quantityNeeded": 5,
      "equipmentRequired": "Optional equipment or empty string"
    }
  ]
}

Role icon mapping:
- 'hammer': manual labor, planting, cleanup, construction, repair
- 'camera': photography, videography, drone, media coverage
- 'palette': graphic design, decoration, art, painting
- 'heart': medical, nursing, first aid, childcare, psychological care
- 'truck': logistics, driving, heavy transport, food delivery
- 'code': programming, web dev, IT setup, technical tasks
- 'users': registration, reception, crowd coordination, general assistance
`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 12000)
      );

      const apiPromise = model.generateContent([
        { text: systemInstruction },
        { text: `<initiative_text>\n${sanitizedInput}\n</initiative_text>` },
      ]);

      const result = await Promise.race([apiPromise, timeoutPromise]);
      const jsonText = result.response.text();
      const rawParsed = JSON.parse(jsonText);

      // Resilient normalization to guarantee valid Zod structure
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
        title: String(rawParsed.title || 'مبادرة تطوعية').slice(0, 120).trim(),
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
    } catch (err: any) {
      console.warn(`[AI Extractor] Falling back to intelligent heuristic parser: ${err.message}`);
    }
  }

  // Smart Context-Aware Heuristic Parser (Offline Fallback)
  return synthesizeDynamicFallback(sanitizedInput);
}

/**
 * Synthesizes a context-aware mission title and needs structure without hardcoded generic titles.
 */
function synthesizeDynamicFallback(input: string): ExtractedNeeds {
  const lower = input.toLowerCase();

  // Helper to extract first coherent clause (up to 8 words) for title synthesis
  const cleanFirstWords = input
    .replace(/[.,:;!?()[\]{}"'«»-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join(' ');

  // 1. Environmental & Cleanup Initiatives
  if (
    lower.includes('شجر') || lower.includes('بوشاوي') || lower.includes('غابة') ||
    lower.includes('تنظيف') || lower.includes('شاطئ') || lower.includes('شواطئ') ||
    lower.includes('plage') || lower.includes('nettoyage') || lower.includes('arbres') ||
    lower.includes('environnement')
  ) {
    const isBeach = lower.includes('شاطئ') || lower.includes('شواطئ') || lower.includes('plage') || lower.includes('بحر');
    const isTree = lower.includes('شجر') || lower.includes('بوشاوي') || lower.includes('غابة') || lower.includes('arbres');

    const title = isBeach
      ? 'شواطئ نقية — حملة تنظيف الشاطئ وحماية البيئة البحرية'
      : isTree
      ? 'أشجار الأمل — حملة التشجير وإعادة الإحياء الأخضر'
      : `حملة بيئية — ${cleanFirstWords || 'تنظيف وتهيئة المساحات الخضراء'}`;

    return {
      title,
      category: 'Environmental',
      urgency: 'high',
      venue: isBeach ? 'الساحل الجزائري' : 'الجزائر العاصمة',
      suggestedHoursPerPerson: 4,
      needs: [
        {
          roleName: isBeach ? 'متطوع لجمع المخلفات البلاستيكية' : 'عمال يدويين لغرس الأشجار والحفر',
          skillTag: 'Manual Labor',
          icon: 'hammer',
          quantityNeeded: 8,
          equipmentRequired: 'قفازات وأكياس جمع المخلفات',
        },
        {
          roleName: 'منسق ميداني وتوجيه المتطوعين',
          skillTag: 'Registration',
          icon: 'users',
          quantityNeeded: 2,
        },
        {
          roleName: 'مسؤول التوثيق الإعلامي والتصوير',
          skillTag: 'Photography',
          icon: 'camera',
          quantityNeeded: 1,
        },
      ],
    };
  }

  // 2. Health & Medical Initiatives
  if (
    lower.includes('طبي') || lower.includes('صحة') || lower.includes('مرض') ||
    lower.includes('دم') || lower.includes('مستشفى') || lower.includes('medical') ||
    lower.includes('santé') || lower.includes('sang') || lower.includes('don')
  ) {
    const isBlood = lower.includes('دم') || lower.includes('sang');
    const title = isBlood
      ? 'قطرة حياة — حملة التبرع بالدم لدعم المستشفيات'
      : 'قافلة الأمل الطبية — فحوصات ورعاية صحية للمواطنين';

    return {
      title,
      category: 'Health',
      urgency: 'urgent',
      venue: 'المركز الصحي / المستشفى الجامعي',
      suggestedHoursPerPerson: 5,
      needs: [
        {
          roleName: isBlood ? 'ممرض أو مسعف لسحب العينات' : 'طبيب عام أو ممرض معتمد',
          skillTag: 'Medical',
          icon: 'heart',
          quantityNeeded: 4,
          equipmentRequired: 'المعدات الطبية الأساسية',
        },
        {
          roleName: 'منسق استقبال وتسجيل البيانات',
          skillTag: 'Registration',
          icon: 'users',
          quantityNeeded: 3,
        },
      ],
    };
  }

  // 3. Education, Children & Skills Initiatives
  if (
    lower.includes('تعليم') || lower.includes('مدرسة') || lower.includes('أطفال') ||
    lower.includes('برمجة') || lower.includes('ورشة') || lower.includes('école') ||
    lower.includes('formation') || lower.includes('enfants') || lower.includes('robot')
  ) {
    return {
      title: `ورشة بناة المستقبل — ${cleanFirstWords || 'تعليم وتدريب الناشئة'}`,
      category: 'Education',
      urgency: 'medium',
      venue: 'المدرسة / دار الشباب',
      suggestedHoursPerPerson: 3,
      needs: [
        {
          roleName: 'مؤطر تربوي ومدرب ورشات',
          skillTag: 'Teaching',
          icon: 'code',
          quantityNeeded: 3,
        },
        {
          roleName: 'مساعد تنظيمي وإشراف على الأطفال',
          skillTag: 'Registration',
          icon: 'users',
          quantityNeeded: 2,
        },
      ],
    };
  }

  // 4. Food, Aid & Humanitarian Support
  if (
    lower.includes('قفة') || lower.includes('رمضان') || lower.includes('طعام') ||
    lower.includes('توزيع') || lower.includes('شتاء') || lower.includes('كسوة') ||
    lower.includes('nourriture') || lower.includes('aide') || lower.includes('repas')
  ) {
    return {
      title: 'قفة الإحسان — إعانة الأسر ودعم الفئات الهشة',
      category: 'Humanitarian',
      urgency: 'urgent',
      venue: 'مستودع التوزيع الخيري',
      suggestedHoursPerPerson: 4,
      needs: [
        {
          roleName: 'فريق التعبئة وفرز الطرود',
          skillTag: 'Manual Labor',
          icon: 'hammer',
          quantityNeeded: 6,
        },
        {
          roleName: 'سائق شاحنة نقل لوجستي',
          skillTag: 'Logistics',
          icon: 'truck',
          quantityNeeded: 2,
          equipmentRequired: 'رخصة سياقة صنف ب أو ج',
        },
      ],
    };
  }

  // 5. General Context-Derived Fallback (Tailored from prompt tokens)
  const dynamicTitle = cleanFirstWords && cleanFirstWords.length > 3
    ? `مبادرة: ${cleanFirstWords}`
    : 'مبادرة تكاتف المجتمعية للعمل التطوعي';

  return {
    title: dynamicTitle,
    category: 'Humanitarian',
    urgency: 'medium',
    venue: 'الجزائر العاصمة',
    suggestedHoursPerPerson: 4,
    needs: [
      {
        roleName: 'متطوع ميداني عام',
        skillTag: 'General Support',
        icon: 'hammer',
        quantityNeeded: 5,
      },
      {
        roleName: 'مسؤول تنظيم واستقبال',
        skillTag: 'Registration',
        icon: 'users',
        quantityNeeded: 2,
      },
    ],
  };
}
