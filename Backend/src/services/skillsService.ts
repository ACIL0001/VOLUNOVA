import { GoogleGenerativeAI } from '@google/generative-ai';
import { User } from '../models';

export interface CanonicalSkill {
  id: string;
  name: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  category: string;
  icon: 'hammer' | 'camera' | 'palette' | 'heart' | 'truck' | 'code' | 'users' | 'sparkles';
  aliases: string[];
}

export interface SkillCategory {
  id: string;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  icon: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'all', labelFr: 'Toutes', labelAr: 'الكل', labelEn: 'All', icon: '✨' },
  { id: 'Tech & Digital', labelFr: 'Tech & Numérique', labelAr: 'تكنولوجيا ورقمي', labelEn: 'Tech & Digital', icon: '💻' },
  { id: 'Santé & Soins', labelFr: 'Santé & Médical', labelAr: 'صحة ورعاية', labelEn: 'Health & Care', icon: '🩺' },
  { id: 'Travaux & BTP', labelFr: 'Travaux & Rénovation', labelAr: 'أشغال وبناء', labelEn: 'Construction & Repair', icon: '🔨' },
  { id: 'Aide Humanitaire', labelFr: 'Aide & Alimentaire', labelAr: 'مساعدات وإطعام', labelEn: 'Humanitarian & Food', icon: '🍲' },
  { id: 'Éducation & Jeunesse', labelFr: 'Éducation & Soutien', labelAr: 'تعليم وتدريب', labelEn: 'Education & Tutoring', icon: '📚' },
  { id: 'Environnement & Nature', labelFr: 'Écologie & Arbres', labelAr: 'تشجير وبيئة', labelEn: 'Environment & Nature', icon: '🌲' },
  { id: 'Logistique & Transport', labelFr: 'Transport & Chauffeur', labelAr: 'نقل ولوجستيك', labelEn: 'Logistics & Driving', icon: '🚗' },
  { id: 'Média & Communication', labelFr: 'Photo & Vidéo', labelAr: 'تصوير وإعلام', labelEn: 'Media & Photo', icon: '📸' },
  { id: 'Organisation', labelFr: 'Accueil & Événements', labelAr: 'تنظيم واستقبال', labelEn: 'Event & Organization', icon: '🤝' },
];

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  {
    id: 'web_development',
    name: 'Développement Web & Informatique',
    nameFr: 'Développement Web & Informatique',
    nameEn: 'Web Development & IT',
    nameAr: 'تطوير الويب والمعلوماتية',
    category: 'Tech & Digital',
    icon: 'code',
    aliases: ['web', 'code', 'site', 'developpeur', 'programmation', 'react', 'javascript', 'python', 'logiciel', 'informatique', 'ordinateur', 'برمجة', 'موقع', 'تطوير', 'كمبيوتر', 'حاسوب', 'معلوماتية', 'مواقع', 'تطبيقات'],
  },
  {
    id: 'graphic_design',
    name: 'Design Graphique & Création',
    nameFr: 'Design Graphique & Création',
    nameEn: 'Graphic Design',
    nameAr: 'تصميم جرافيك وإبداع',
    category: 'Tech & Digital',
    icon: 'palette',
    aliases: ['design', 'graphiste', 'logo', 'photoshop', 'illustrator', 'affiche', 'visuel', 'canva', 'infographie', 'تصميم', 'شعار', 'جرافيك', 'ملصق', 'إعلان', 'رسم', 'إبداع'],
  },
  {
    id: 'masonry_construction',
    name: 'Maçonnerie & Bâtiment',
    nameFr: 'Maçonnerie & Bâtiment',
    nameEn: 'Masonry & Renovation',
    nameAr: 'بناء وترميم وتجديد',
    category: 'Travaux & BTP',
    icon: 'hammer',
    aliases: [
      'fix walls', 'reparer mur', 'macon', 'maconnerie', 'peinture', 'platrerie', 'batiment', 'bricolage',
      'plomberie', 'electricite', 'carrelage', 'menuiserie', 'construction', 'reparations', 'reparation',
      'بناء', 'ترميم', 'أشغال', 'صيانة', 'دهان', 'سباكة', 'كهرباء', 'نجارة', 'بنا', 'عمارة', 'بناء وترميم', 'أشغال وبناء'
    ],
  },
  {
    id: 'first_aid',
    name: 'Premiers Secours & Médical',
    nameFr: 'Premiers Secours & Médical',
    nameEn: 'First Aid & Medical',
    nameAr: 'إسعافات أولية وطب',
    category: 'Santé & Soins',
    icon: 'heart',
    aliases: ['secours', 'secourisme', 'medecin', 'infirmier', 'soins', 'urgence', 'ambulance', 'sante', 'paramedical', 'pansement', 'croissant rouge', 'إسعاف', 'طب', 'طبيب', 'صحة', 'تمريض', 'علاج', 'أدوية', 'جروح', 'هلال أحمر', 'ممرض', 'إسعافات'],
  },
  {
    id: 'driving_logistics',
    name: 'Conduite & Logistique',
    nameFr: 'Conduite & Logistique',
    nameEn: 'Driving & Logistics',
    nameAr: 'نقل وسياقة ولوجستيك',
    category: 'Logistique & Transport',
    icon: 'truck',
    aliases: ['permis', 'chauffeur', 'livraison', 'conduite', 'transport', 'vehicule', 'camion', 'fourgon', 'deplacement', 'ramassage', 'نقل', 'سياقة', 'سائق', 'توصيل', 'شاحنة', 'سيارة', 'توزيع', 'لوجستيك'],
  },
  {
    id: 'food_prep_distribution',
    name: 'Restauration & Colis Alimentaires',
    nameFr: 'Restauration & Colis Alimentaires',
    nameEn: 'Food Preparation & Aid Distribution',
    nameAr: 'تحضير وتوزيع وجبات ومساعدات',
    category: 'Aide Humanitaire',
    icon: 'users',
    aliases: [
      'cuisine', 'faire a manger', 'cuisiner', 'repas', 'nourriture', 'colis', 'tri alimentaire',
      'distribution repas', 'restauration', 'chef cuisinier', 'iftar', 'panier', 'aide sociale',
      'طبخ', 'إطعام', 'وجبات', 'توزيع', 'طعام', 'مطبخ', 'قفة', 'إفطار', 'مساعدات', 'إغاثة', 'إطعام خيري'
    ],
  },
  {
    id: 'teaching_tutoring',
    name: 'Soutien Scolaire & Enseignement',
    nameFr: 'Soutien Scolaire & Enseignement',
    nameEn: 'Teaching & Tutoring',
    nameAr: 'تعليم وتدريب ودعم مدرسي',
    category: 'Éducation & Jeunesse',
    icon: 'sparkles',
    aliases: [
      'cours', 'aide aux devoirs', 'enseigner', 'professeur', 'enfants', 'alphabetisation', 'soutien',
      'mathematiques', 'pedagogie', 'formation', 'lecture', 'ecole', 'jeunesse',
      'تعليم', 'تدريس', 'دروس', 'دعم', 'مدرسة', 'أطفال', 'محو أمية', 'رياضيات', 'أستاذ', 'معلم', 'تدريب'
    ],
  },
  {
    id: 'reforestation_environment',
    name: 'Reboisement & Écologie',
    nameFr: 'Reboisement & Écologie',
    nameEn: 'Reforestation & Environment',
    nameAr: 'تشجير وبيئة ونظافة',
    category: 'Environnement & Nature',
    icon: 'sparkles',
    aliases: [
      'arbres', 'plantation', 'foret', 'nettoyage', 'plage', 'dechets', 'jardinage',
      'recyclage', 'ecologie', 'environnement', 'arrosage', 'nettoyage quartier',
      'تشجير', 'غرس', 'أشجار', 'بيئة', 'تنظيف', 'نظافة', 'شاطئ', 'نفايات', 'طبيعة', 'غابة'
    ],
  },
  {
    id: 'photography_videography',
    name: 'Photographie & Vidéo',
    nameFr: 'Photographie & Vidéo',
    nameEn: 'Photography & Video',
    nameAr: 'تصوير فوتوغرافي وفيديو',
    category: 'Média & Communication',
    icon: 'camera',
    aliases: ['photo', 'photographe', 'video', 'drone', 'camera', 'montage', 'reportage', 'cameraman', 'couverture media', 'تصوير', 'فيديو', 'كاميرا', 'مونتاج', 'صورة', 'مصور'],
  },
  {
    id: 'translation_languages',
    name: 'Traduction & Langues',
    nameFr: 'Traduction & Langues',
    nameEn: 'Translation & Languages',
    nameAr: 'ترجمة ولغات',
    category: 'Média & Communication',
    icon: 'users',
    aliases: ['traduction', 'interprete', 'langues', 'anglais', 'francais', 'arabe', 'amazigh', 'espagnol', 'ترجمة', 'لغات', 'مترجم', 'فرنسية', 'إنجليزية', 'عربية', 'أمازيغية'],
  },
  {
    id: 'event_organization',
    name: 'Accueil & Coordination d’Événements',
    nameFr: 'Accueil & Coordination d’Événements',
    nameEn: 'Event Coordination & Reception',
    nameAr: 'استقبال وتنظيم فعاليات',
    category: 'Organisation',
    icon: 'users',
    aliases: ['accueil', 'organisation', 'coordination', 'orientation', 'animation', 'evenement', 'guide', 'securite', 'gestion foule', 'تنظيم', 'استقبال', 'توجيه', 'تنسيق', 'فعاليات', 'حشود', 'إشراف'],
  },
];

/**
 * Intelligent Dynamic Gemini AI Skill Classifier & Normalizer
 * Categorizes free-text user skills into clean canonical taxonomy to prevent DB pollution.
 */
export function getCategoryLabel(category: string, lang: string = 'fr'): string {
  const cat = SKILL_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase() || c.labelFr.toLowerCase() === category.toLowerCase() || c.labelAr === category);
  if (!cat) return category;
  if (lang === 'ar') return cat.labelAr;
  if (lang === 'en') return cat.labelEn;
  return cat.id;
}

export function formatSkillWithCategoryAndInput(category: string, rawInput: string, lang: string = 'fr'): string {
  const catLabel = getCategoryLabel(category, lang);
  const clean = (rawInput || '').trim();
  if (!clean) return catLabel;
  // If already formatted with brackets like "Category (xxx)", keep as is
  if (clean.includes('(') && clean.includes(')')) return clean;
  if (clean.toLowerCase() === catLabel.toLowerCase()) return catLabel;
  return `${catLabel} (${clean})`;
}

export function normalizeSkillToBracketFormat(skill: string, locale: string = 'fr'): string {
  const clean = (skill || '').trim();
  if (!clean) return clean;
  if (clean.includes('(') && clean.includes(')')) {
    return clean;
  }
  const lowerQ = clean.toLowerCase();
  const direct = CANONICAL_SKILLS.find(
    (s) =>
      s.id.toLowerCase() === lowerQ ||
      s.nameFr.toLowerCase() === lowerQ ||
      s.nameAr === clean ||
      s.aliases.some((a) => a.toLowerCase() === lowerQ)
  );

  const isArabic = /[\u0600-\u06FF]/.test(clean) || locale === 'ar';

  if (direct) {
    return formatSkillWithCategoryAndInput(direct.category, clean, isArabic ? 'ar' : 'fr');
  }

  const categoryKeywords: Record<string, string[]> = {
    'Santé & Soins': ['صحة', 'طب', 'طبيب', 'تمريض', 'إسعاف', 'مستشفى', 'علاج', 'sante', 'medical', 'infirmier', 'secourisme', 'soin'],
    'Travaux & BTP': ['بناء', 'ترميم', 'صيانة', 'دهان', 'سباكة', 'كهرباء', 'نجارة', 'maconnerie', 'peinture', 'reparation', 'electricite', 'plomberie'],
    'Aide Humanitaire': ['إطعام', 'طبخ', 'وجبات', 'قفة', 'مساعدات', 'توزيع', 'nourriture', 'repas', 'cuisine', 'aide', 'humanitaire', 'distribution'],
    'Éducation & Jeunesse': ['تعليم', 'تدريس', 'دروس', 'دعم', 'مدرسة', 'أطفال', 'formation', 'cours', 'scolaire', 'tutoring', 'enfant'],
    'Environnement & Nature': ['تشجير', 'غرس', 'بيئة', 'تنظيف', 'شاطئ', 'أشجار', 'arbre', 'environnement', 'nature', 'foret', 'plage'],
    'Logistique & Transport': ['نقل', 'سياقة', 'سائق', 'شاحنة', 'توصيل', 'permis', 'conduite', 'transport', 'vehicule'],
    'Média & Communication': ['تصوير', 'فيديو', 'كاميرا', 'ترجمة', 'photo', 'video', 'traduction'],
    'Tech & Digital': ['برمجة', 'موقع', 'تطبيق', 'كمبيوتر', 'معلوماتية', 'code', 'web', 'informatique'],
    'Organisation': ['تنظيم', 'استقبال', 'توجيه', 'تنسيق', 'accueil', 'organisation', 'evenement'],
  };

  let bestCat = 'Organisation';
  for (const [catName, kws] of Object.entries(categoryKeywords)) {
    if (kws.some((k) => lowerQ.includes(k) || k.includes(lowerQ))) {
      bestCat = catName;
      break;
    }
  }

  return formatSkillWithCategoryAndInput(bestCat, clean, isArabic ? 'ar' : 'fr');
}

export async function aiClassifyAndEnhanceSkill(rawPrompt: string, locale: string = 'fr'): Promise<{
  matchedCanonical: CanonicalSkill | null;
  normalizedSkill: {
    id: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    category: string;
    icon: string;
    rawInput?: string;
    formattedSkill?: string;
  };
  explanation: string;
  isCanonical: boolean;
}> {
  const query = (rawPrompt || '').trim();
  const lowerQ = query.toLowerCase();

  // 1. Direct Canonical Match Check (Exact match on canonical titles or exact aliases)
  const directMatch = CANONICAL_SKILLS.find((s) => {
    if (
      s.nameFr.toLowerCase() === lowerQ ||
      s.nameEn.toLowerCase() === lowerQ ||
      s.nameAr === query ||
      s.nameAr === lowerQ
    ) {
      return true;
    }
    // Check if query exactly equals an alias, or if query is a short 1-2 word exact alias
    return s.aliases.some((a) => {
      const lowerA = a.toLowerCase();
      return lowerA === lowerQ;
    });
  });

  if (directMatch) {
    const formattedFr = formatSkillWithCategoryAndInput(directMatch.category, query, 'fr');
    const formattedAr = formatSkillWithCategoryAndInput(directMatch.category, query, 'ar');
    const formattedEn = formatSkillWithCategoryAndInput(directMatch.category, query, 'en');

    return {
      matchedCanonical: directMatch,
      normalizedSkill: {
        id: directMatch.id,
        nameFr: formattedFr,
        nameEn: formattedEn,
        nameAr: formattedAr,
        category: directMatch.category,
        icon: getCategoryEmoji(directMatch.category),
        rawInput: query,
        formattedSkill: locale === 'ar' ? formattedAr : formattedFr,
      },
      explanation: locale === 'ar'
        ? `مطابقة مباشرة مع: ${directMatch.nameAr}`
        : `Correspond directement à la compétence officielle : ${directMatch.nameFr}`,
      isCanonical: true,
    };
  }

  // 2. Query Gemini AI with modern models & 3.5s timeout
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'mock-key') {
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash'];
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
You are the AI Skill Taxonomy and Normalization Engine for the VOLUNOVA civic volunteering platform in Algeria.
A volunteer entered this skill or capability description: "${query}".

Your job is to prevent database pollution (avoiding duplicate or messy strings) by categorizing and standardizing this skill.

Available categories:
- "Tech & Digital"
- "Santé & Soins"
- "Travaux & BTP"
- "Aide Humanitaire"
- "Éducation & Jeunesse"
- "Environnement & Nature"
- "Logistique & Transport"
- "Média & Communication"
- "Organisation"

Existing canonical skill IDs:
${JSON.stringify(CANONICAL_SKILLS.map((s) => ({ id: s.id, name: s.nameFr, category: s.category, aliases: s.aliases.slice(0, 5) })))}

Instructions:
1. If the phrase matches one of the canonical skills above (e.g. "je répare les murs" -> masonry_construction, "cooking soup" -> food_prep_distribution), map it to that canonical ID.
2. If it's a distinct but valid civic skill, standardize it into a clean name in French, English, and Arabic, and classify it into the best category.
3. Suggest a suitable single emoji icon.
4. Give a brief, helpful 1-sentence explanation in ${locale === 'ar' ? 'Arabic' : 'French'}.

Return JSON strictly:
{
  "matchedCanonicalId": string (canonical ID or "custom"),
  "category": string (must be one of the 9 categories above),
  "standardTitleFr": string,
  "standardTitleEn": string,
  "standardTitleAr": string,
  "iconEmoji": string (single emoji),
  "explanation": string
}
`;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const genPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
        );

        const result: any = await Promise.race([genPromise, timeoutPromise]);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        if (parsed.matchedCanonicalId && parsed.matchedCanonicalId !== 'custom') {
          const canonical = CANONICAL_SKILLS.find((s) => s.id === parsed.matchedCanonicalId);
          if (canonical) {
            const formattedFr = formatSkillWithCategoryAndInput(canonical.category, query, 'fr');
            const formattedAr = formatSkillWithCategoryAndInput(canonical.category, query, 'ar');
            const formattedEn = formatSkillWithCategoryAndInput(canonical.category, query, 'en');

            return {
              matchedCanonical: canonical,
              normalizedSkill: {
                id: canonical.id,
                nameFr: formattedFr,
                nameEn: formattedEn,
                nameAr: formattedAr,
                category: canonical.category,
                icon: getCategoryEmoji(canonical.category),
                rawInput: query,
                formattedSkill: locale === 'ar' ? formattedAr : formattedFr,
              },
              explanation: parsed.explanation || `Reclassé automatiquement dans "${canonical.nameFr}".`,
              isCanonical: true,
            };
          }
        }

        // Normalized custom skill mapped to standard category
        let safeId = (parsed.standardTitleEn || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 40);

        if (!safeId || safeId.length < 2) {
          safeId = `skill_${Date.now()}`;
        }

        const category = parsed.category || 'Organisation';
        const formattedFr = formatSkillWithCategoryAndInput(category, query, 'fr');
        const formattedAr = formatSkillWithCategoryAndInput(category, query, 'ar');
        const formattedEn = formatSkillWithCategoryAndInput(category, query, 'en');

        return {
          matchedCanonical: null,
          normalizedSkill: {
            id: safeId,
            nameFr: formattedFr,
            nameEn: formattedEn,
            nameAr: formattedAr,
            category,
            icon: parsed.iconEmoji || getCategoryEmoji(category),
            rawInput: query,
            formattedSkill: locale === 'ar' ? formattedAr : formattedFr,
          },
          explanation: parsed.explanation || `Compétence standardisée dans la catégorie ${category}.`,
          isCanonical: false,
        };
      } catch (err: any) {
        console.warn(`[SkillsService] Model ${modelName} error:`, err.message);
        // Continue to next candidate model
      }
    }
  }

  // 3. Resilient Heuristic Fallback (Never hangs, never blindly assigns web_development)
  const categoryKeywords: Record<string, string[]> = {
    'Travaux & BTP': ['بناء', 'ترميم', 'صيانة', 'دهان', 'كهرباء', 'سباكة', 'نجارة', 'reparer', 'peindre', 'bricolage', 'murs', 'plomberie'],
    'Aide Humanitaire': ['إطعام', 'طبخ', 'وجبات', 'قفة', 'مساعدات', 'توزيع', 'nourriture', 'cuisine', 'repas', 'colis', 'social'],
    'Santé & Soins': ['صحة', 'طب', 'طبيب', 'تمريض', 'إسعاف', 'علاج', 'أدوية', 'sante', 'soins', 'medical', 'premiers secours'],
    'Éducation & Jeunesse': ['تعليم', 'تدريس', 'دروس', 'دعم', 'مدرسة', 'أطفال', 'formation', 'cours', 'enseigner', 'tutoring'],
    'Environnement & Nature': ['تشجير', 'غرس', 'بيئة', 'تنظيف', 'شاطئ', 'أشجار', 'arbre', 'nettoyage', 'plage', 'ecologie'],
    'Logistique & Transport': ['نقل', 'سياقة', 'سائق', 'شاحنة', 'توصيل', 'permis', 'conduite', 'transport', 'vehicule'],
    'Média & Communication': ['تصوير', 'فيديو', 'كاميرا', 'ترجمة', 'législation', 'photo', 'video', 'traduction'],
    'Tech & Digital': ['برمجة', 'موقع', 'تطبيق', 'كمبيوتر', 'معلوماتية', 'code', 'web', 'informatique'],
    'Organisation': ['تنظيم', 'استقبال', 'توجيه', 'تنسيق', 'accueil', 'organisation', 'evenement'],
  };

  let bestCategory = 'Organisation';
  for (const [catName, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => lowerQ.includes(k) || k.includes(lowerQ))) {
      bestCategory = catName;
      break;
    }
  }

  let cleanSlug = query
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);

  if (!cleanSlug || cleanSlug.length < 2) {
    cleanSlug = `skill_${Date.now()}`;
  }

  const formattedFr = formatSkillWithCategoryAndInput(bestCategory, query, 'fr');
  const formattedAr = formatSkillWithCategoryAndInput(bestCategory, query, 'ar');
  const formattedEn = formatSkillWithCategoryAndInput(bestCategory, query, 'en');

  return {
    matchedCanonical: null,
    normalizedSkill: {
      id: cleanSlug,
      nameFr: formattedFr,
      nameEn: formattedEn,
      nameAr: formattedAr,
      category: bestCategory,
      icon: getCategoryEmoji(bestCategory),
      rawInput: query,
      formattedSkill: locale === 'ar' ? formattedAr : formattedFr,
    },
    explanation: locale === 'ar'
      ? `تم التوجيه الذكي إلى فئة : ${bestCategory}`
      : `Classé automatiquement dans la catégorie : ${bestCategory}`,
    isCanonical: false,
  };
}

function getCategoryEmoji(category: string): string {
  const cat = SKILL_CATEGORIES.find((c) => c.id === category);
  return cat?.icon || '✨';
}

/**
 * Matches a user free-text query against canonical skills
 */
export async function suggestSkills(query: string, locale: string = 'fr'): Promise<{
  exactMatches: CanonicalSkill[];
  aiSuggestion: CanonicalSkill | null;
  aiExplanation?: string;
}> {
  const cleanQ = (query || '').trim().toLowerCase();
  if (!cleanQ || cleanQ.length < 2) {
    return { exactMatches: [], aiSuggestion: null };
  }

  // 1. Fast Keyword / Substring Matches
  const matches = CANONICAL_SKILLS.filter((skill) => {
    if (skill.nameFr.toLowerCase().includes(cleanQ)) return true;
    if (skill.nameEn.toLowerCase().includes(cleanQ)) return true;
    if (skill.nameAr.includes(cleanQ)) return true;
    if (skill.category.toLowerCase().includes(cleanQ)) return true;
    return skill.aliases.some((alias) => alias.includes(cleanQ) || cleanQ.includes(alias));
  });

  if (matches.length > 0 && cleanQ.length <= 4) {
    return { exactMatches: matches.slice(0, 5), aiSuggestion: matches[0] };
  }

  // 2. Semantic inference
  const aiResult = await aiClassifyAndEnhanceSkill(cleanQ, locale);
  return {
    exactMatches: matches.slice(0, 5),
    aiSuggestion: aiResult.matchedCanonical,
    aiExplanation: aiResult.explanation,
  };
}

/**
 * Returns aggregated statistics of real skills registered by platform volunteers.
 */
export async function getActiveRegisteredSkills(): Promise<{
  id: string;
  name: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  category: string;
  icon: string;
  volunteerCount: number;
}[]> {
  const aggregated = await User.aggregate([
    { $match: { role: 'volunteer' } },
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const skillMap = new Map<string, {
    id: string;
    name: string;
    nameFr: string;
    nameEn: string;
    nameAr: string;
    category: string;
    icon: string;
    volunteerCount: number;
  }>();

  for (const item of aggregated) {
    const rawSkill = String(item._id || '').trim();
    if (!rawSkill) continue;

    // 1. Check if rawSkill matches a canonical skill directly (by id, name, or alias)
    const canonical = CANONICAL_SKILLS.find(
      (c) =>
        c.id.toLowerCase() === rawSkill.toLowerCase() ||
        c.nameFr.toLowerCase() === rawSkill.toLowerCase() ||
        c.nameEn.toLowerCase() === rawSkill.toLowerCase() ||
        c.nameAr === rawSkill ||
        c.name.toLowerCase() === rawSkill.toLowerCase() ||
        c.aliases.some((a) => a.toLowerCase() === rawSkill.toLowerCase())
    );

    if (canonical) {
      const existing = skillMap.get(canonical.id);
      if (existing) {
        existing.volunteerCount += item.count;
      } else {
        skillMap.set(canonical.id, {
          id: canonical.id,
          name: canonical.nameFr,
          nameFr: canonical.nameFr,
          nameEn: canonical.nameEn,
          nameAr: canonical.nameAr,
          category: canonical.category,
          icon: canonical.icon,
          volunteerCount: item.count,
        });
      }
      continue;
    }

    // 2. Custom skill: check if formatted as "Category (raw)"
    const match = rawSkill.match(/^([^(]+)\s*\((.+)\)$/);
    let category = 'Organisation';
    let icon = 'sparkles';
    let nameFr = rawSkill;
    let nameAr = rawSkill;

    if (match) {
      const parsedCat = match[1].trim();
      const rawUserPart = match[2].trim();
      const matchedCat = SKILL_CATEGORIES.find(
        (c) =>
          c.id.toLowerCase() === parsedCat.toLowerCase() ||
          c.labelAr === parsedCat ||
          c.labelFr.toLowerCase() === parsedCat.toLowerCase()
      );
      if (matchedCat) {
        category = matchedCat.id;
        icon = matchedCat.icon;
        nameFr = `${matchedCat.id} (${rawUserPart})`;
        nameAr = `${matchedCat.labelAr} (${rawUserPart})`;
      }
    }

    const customId = rawSkill.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '_').slice(0, 40);
    const existing = skillMap.get(customId);
    if (existing) {
      existing.volunteerCount += item.count;
    } else {
      skillMap.set(customId, {
        id: customId,
        name: rawSkill,
        nameFr,
        nameEn: nameFr,
        nameAr,
        category,
        icon,
        volunteerCount: item.count,
      });
    }
  }

  // 3. Include remaining canonical skills that were not yet encountered
  for (const skill of CANONICAL_SKILLS) {
    if (!skillMap.has(skill.id)) {
      skillMap.set(skill.id, {
        id: skill.id,
        name: skill.nameFr,
        nameFr: skill.nameFr,
        nameEn: skill.nameEn,
        nameAr: skill.nameAr,
        category: skill.category,
        icon: skill.icon,
        volunteerCount: 0,
      });
    }
  }

  return Array.from(skillMap.values());
}
