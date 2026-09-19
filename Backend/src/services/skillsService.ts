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

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  {
    id: 'web_development',
    name: 'Développement Web & Informatique',
    nameFr: 'Développement Web & Informatique',
    nameEn: 'Web Development & IT',
    nameAr: 'تطوير الويب والمعلوماتية',
    category: 'Tech & Digital',
    icon: 'code',
    aliases: ['web', 'code', 'site', 'developpeur', 'programmation', 'react', 'javascript', 'python', 'logiciel', 'informatique'],
  },
  {
    id: 'graphic_design',
    name: 'Design Graphique & Création',
    nameFr: 'Design Graphique & Création',
    nameEn: 'Graphic Design',
    nameAr: 'تصميم جرافيك وإبداع',
    category: 'Tech & Digital',
    icon: 'palette',
    aliases: ['design', 'graphiste', 'logo', 'photoshop', 'illustrator', 'affiche', 'visuel', 'canva'],
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
      'plomberie', 'electricite', 'carrelage', 'menuiserie', 'construction', 'reparations'
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
    aliases: ['secours', 'secourisme', 'medecin', 'infirmier', 'soins', 'urgence', 'ambulance', 'sante', 'paramedical', 'pansement'],
  },
  {
    id: 'driving_logistics',
    name: 'Conduite & Logistique',
    nameFr: 'Conduite & Logistique',
    nameEn: 'Driving & Logistics',
    nameAr: 'نقل وسياقة ولوجستيك',
    category: 'Logistique & Transport',
    icon: 'truck',
    aliases: ['permis', 'chauffeur', 'livraison', 'conduite', 'transport', 'vehicule', 'camion', 'fourgon', 'deplacement'],
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
      'distribution repas', 'restauration', 'chef cuisinier', 'iftar', 'panier'
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
      'mathematiques', 'pedagogie', 'formation', 'lecture', 'ecole'
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
      'recyclage', 'ecologie', 'environnement', 'arrosage'
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
    aliases: ['photo', 'photographe', 'video', 'drone', 'camera', 'montage', 'reportage', 'cameraman'],
  },
  {
    id: 'translation_languages',
    name: 'Traduction & Langues',
    nameFr: 'Traduction & Langues',
    nameEn: 'Translation & Languages',
    nameAr: 'ترجمة ولغات',
    category: 'Communication',
    icon: 'users',
    aliases: ['traduction', 'interprete', 'langues', 'anglais', 'francais', 'arabe', 'amazigh', 'espagnol'],
  },
  {
    id: 'event_organization',
    name: 'Accueil & Coordination d’Événements',
    nameFr: 'Accueil & Coordination d’Événements',
    nameEn: 'Event Coordination & Reception',
    nameAr: 'استقبال وتنظيم فعاليات',
    category: 'Organisation',
    icon: 'users',
    aliases: ['accueil', 'organisation', 'coordination', 'orientation', 'animation', 'evenement', 'guide', 'securite'],
  },
];

/**
 * Matches a user free-text query against canonical skills using:
 * 1. Immediate local keyword/prefix matching
 * 2. Gemini AI semantic classification for action phrases (e.g. "fix walls", "faire à manger", "repair plumbing")
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

  // If we have strong direct keyword matches, return them immediately
  if (matches.length > 0 && cleanQ.length <= 4) {
    return { exactMatches: matches.slice(0, 5), aiSuggestion: matches[0] };
  }

  // 2. Gemini AI Semantic Inference for Action Phrases / Colloquialisms
  let aiSuggestion: CanonicalSkill | null = matches[0] || null;
  let aiExplanation: string | undefined = undefined;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'mock-key') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `
You are the Skill Taxonomy Engine for VOLUNOVA volunteering.
A volunteer typed the following skill or action description: "${cleanQ}".

Match this phrase to the SINGLE most relevant Canonical Skill ID from this list:
${JSON.stringify(CANONICAL_SKILLS.map((s) => ({ id: s.id, name: s.nameFr, aliases: s.aliases })))}

Output JSON:
{
  "matchedId": string (must be one of the IDs above or "none"),
  "explanation": string (short 1-sentence explanation in French of why it matches, e.g. "Correspond à 'fix walls' (réparation et maçonnerie)")
}
`;

      const result = await model.generateContent(prompt);
      const resText = result.response.text();
      const parsed = JSON.parse(resText);

      if (parsed.matchedId && parsed.matchedId !== 'none') {
        const found = CANONICAL_SKILLS.find((s) => s.id === parsed.matchedId);
        if (found) {
          aiSuggestion = found;
          aiExplanation = parsed.explanation;
        }
      }
    } catch (err: any) {
      console.warn('[SkillsService] AI matching fallback:', err.message);
    }
  }

  return {
    exactMatches: matches.slice(0, 5),
    aiSuggestion,
    aiExplanation,
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

  const countMap = new Map<string, number>();
  for (const item of aggregated) {
    if (item._id && typeof item._id === 'string') {
      countMap.set(item._id.trim(), item.count);
    }
  }

  return CANONICAL_SKILLS.map((skill) => {
    let count = 0;
    count += countMap.get(skill.id) || 0;
    count += countMap.get(skill.name) || 0;
    count += countMap.get(skill.nameFr) || 0;
    count += countMap.get(skill.nameEn) || 0;

    return {
      id: skill.id,
      name: skill.nameFr,
      nameFr: skill.nameFr,
      nameEn: skill.nameEn,
      nameAr: skill.nameAr,
      category: skill.category,
      icon: skill.icon,
      volunteerCount: count,
    };
  });
}
