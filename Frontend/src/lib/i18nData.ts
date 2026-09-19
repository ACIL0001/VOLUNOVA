import { Mission, MissionNeed } from './api';
import { Locale } from '@/locales';

interface MissionLocalization {
  title: string;
  description: string;
  venueName: string;
  needs?: {
    roleMatch: string;
    roleName: string;
    skillTag: string;
    equipmentRequired?: string;
  }[];
}

const MISSION_LOCALIZATIONS: Record<string, Record<Locale, MissionLocalization>> = {
  bouchaoui: {
    ar: {
      title: 'حملة تشجير غابة بوشاوي الكبرى — مبادرة المليون شجرة',
      description: 'انضم إلينا في حملة كبرى لإعادة تشجير غابة بوشاوي بعد الحرائق الأخيرة. نحتاج أيدي عاملة للغرس، درون لتوثيق المساحات المغروسة، ومصمم جرافيك لإطلاق ملصقات التوعية البيئية.',
      venueName: 'غابة بوشاوي، الجزائر العاصمة',
      needs: [
        {
          roleMatch: 'حفر',
          roleName: 'عمال يدويين لغرس الأشجار والحفر',
          skillTag: 'عمل ميداني وشاق',
          equipmentRequired: 'مجرفة وقفازات سميكة',
        },
        {
          roleMatch: 'درون',
          roleName: 'مصور فيديو ومحترف درون',
          skillTag: 'تصوير جوي وتقني',
          equipmentRequired: 'درون بدقة 4K مع بطاريات إضافية',
        },
        {
          roleMatch: 'مصمم',
          roleName: 'مصمم جرافيك وتغطية بصرية',
          skillTag: 'تصميم جرافيكي وهندسة محتوى',
          equipmentRequired: 'حاسوب محمول للعمل السريع',
        },
      ],
    },
    fr: {
      title: 'Reboisement Forêt de Bouchaoui — 1 Million d\'Arbres',
      description: 'Participez à la grande campagne citoyenne de reboisement de la forêt de Bouchaoui suite aux récents incendies. Nous recherchons des volontaires pour planter, un vidéaste drone pour cartographier et un graphiste pour la sensibilisation.',
      venueName: 'Forêt de Bouchaoui, Alger',
      needs: [
        {
          roleMatch: 'حفر',
          roleName: 'Bénévoles pour plantation et creusement',
          skillTag: 'Travaux Manuels & Terrain',
          equipmentRequired: 'Pelles et gants renforcés',
        },
        {
          roleMatch: 'درون',
          roleName: 'Vidéaste drone 4K & photographe',
          skillTag: 'Vidéographie Aérienne',
          equipmentRequired: 'Drone 4K avec batteries de rechange',
        },
        {
          roleMatch: 'مصمم',
          roleName: 'Graphiste & couverture visuelle',
          skillTag: 'Design Graphique & Médias',
          equipmentRequired: 'Ordinateur portable pour création',
        },
      ],
    },
    en: {
      title: 'Bouchaoui Forest Reforestation — 1 Million Trees Campaign',
      description: 'Join our massive community initiative to reforest Bouchaoui forest following recent wildfires. We need field planters, a 4K drone videographer for aerial mapping, and a graphic designer for awareness posters.',
      venueName: 'Bouchaoui Forest, Algiers',
      needs: [
        {
          roleMatch: 'حفر',
          roleName: 'Tree planting & excavation volunteers',
          skillTag: 'Manual Field Labor',
          equipmentRequired: 'Shovels and heavy-duty work gloves',
        },
        {
          roleMatch: 'درون',
          roleName: '4K Drone videographer & photographer',
          skillTag: 'Aerial Videography',
          equipmentRequired: '4K Drone with extra flight batteries',
        },
        {
          roleMatch: 'مصمم',
          roleName: 'Graphic designer & visual coverage',
          skillTag: 'Graphic Design & Media',
          equipmentRequired: 'Laptop for rapid asset creation',
        },
      ],
    },
  },
  medical: {
    ar: {
      title: '🩺 قافلة الأمل الطبية — فحص أطفال القرى المعزولة',
      description: 'قافلة طبية تطوعية لفحص أطفال المدارس الابتدائية في المناطق والقرى المعزولة بولاية البليدة. تقديم كشوفات مجانية لطب العيون، طب الأطفال، وتوزيع حقائب إسعاف أولية.',
      venueName: 'مدرسة الشهداء، جبال الأطلس البليدي',
      needs: [
        {
          roleMatch: 'طبيب',
          roleName: 'أطباء أطفال وممرضين معتمدين',
          skillTag: 'رعاية صحية وتمريض',
          equipmentRequired: 'سماعة طبية ومعقمات',
        },
        {
          roleMatch: 'تنظيم',
          roleName: 'منظمي استقبال وتوجيه التلاميذ',
          skillTag: 'تنظيم ميداني وإدارة حشود',
          equipmentRequired: 'سترات تطوع وسجلات',
        },
      ],
    },
    fr: {
      title: '🩺 Caravane Médicale de l\'Espoir — Écoles Rurales',
      description: 'Caravane médicale bénévole pour le dépistage des écoliers dans les villages isolés de la wilaya de Blida. Examens pédiatriques gratuits, ophtalmologie et kits de premiers secours.',
      venueName: 'École des Martyrs, Atlas Blidéen',
      needs: [
        {
          roleMatch: 'طبيب',
          roleName: 'Pédiatres et infirmiers diplômés',
          skillTag: 'Santé & Soins Médicaux',
          equipmentRequired: 'Stéthoscope et antiseptiques',
        },
        {
          roleMatch: 'تنظيم',
          roleName: 'Coordinateurs d\'accueil et d\'orientation',
          skillTag: 'Logistique & Gestion de Flux',
          equipmentRequired: 'Gilets réfléchissants et tablettes',
        },
      ],
    },
    en: {
      title: '🩺 Hope Medical Caravan — Rural Schoolchildren Screening',
      description: 'Volunteer healthcare mission providing free medical and vision checkups for elementary schoolchildren in remote villages across Blida province.',
      venueName: 'Chouhada Primary School, Blida Atlas',
      needs: [
        {
          roleMatch: 'طبيب',
          roleName: 'Pediatricians & Certified Nurses',
          skillTag: 'Healthcare & Nursing',
          equipmentRequired: 'Stethoscope and clinical sanitizers',
        },
        {
          roleMatch: 'تنظيم',
          roleName: 'Registration & Queue Coordinators',
          skillTag: 'Event Logistics & Coordination',
          equipmentRequired: 'Volunteer vests and clipboards',
        },
      ],
    },
  },
  ramadan: {
    ar: {
      title: '📦 توزيع قفف رمضان العاجلة — إغاثة العائلات المعوزة',
      description: 'حملة طارئة لتعبئة وتوزيع 500 قفة رمضانية محملة بالمواد الأساسية لفائدة العائلات المعوزة وذوي الدخل المحدود في بلدية براقي والمناطق المجاورة.',
      venueName: 'المستودع المركزي للهلال، براقي',
      needs: [
        {
          roleMatch: 'فرز',
          roleName: 'متطوعين لفرز وتعبئة الطرود الغذائية',
          skillTag: 'لوجستيات وتعبئة',
          equipmentRequired: 'قفازات وأشرطة لاصقة',
        },
        {
          roleMatch: 'سائق',
          roleName: 'سائقي شاحنات توزيع ميداني',
          skillTag: 'سياقة ونقل بضائع',
          equipmentRequired: 'رخصة سياقة صنف ب أو ج',
        },
      ],
    },
    fr: {
      title: '📦 Colis Alimentaires Urgents — Solidarité Ramadan',
      description: 'Action solidaire pour conditionner et distribuer 500 colis de denrées essentielles aux foyers défavorisés de la commune de Baraki et des localités avoisinantes.',
      venueName: 'Entrepôt Central du Croissant, Baraki',
      needs: [
        {
          roleMatch: 'فرز',
          roleName: 'Bénévoles pour le tri et le conditionnement',
          skillTag: 'Logistique & Manutention',
          equipmentRequired: 'Gants de protection et adhésifs',
        },
        {
          roleMatch: 'سائق',
          roleName: 'Chauffeurs de livraison utilitaire',
          skillTag: 'Transport & Conduite Utilitaires',
          equipmentRequired: 'Permis B ou C valide',
        },
      ],
    },
    en: {
      title: '📦 Emergency Food Relief Baskets — Community Solidarity',
      description: 'Urgent initiative to package and distribute 500 essential food relief baskets to vulnerable families in Baraki municipality and nearby neighborhoods.',
      venueName: 'Central Community Warehouse, Baraki',
      needs: [
        {
          roleMatch: 'فرز',
          roleName: 'Packaging & Inventory Volunteers',
          skillTag: 'Inventory & Packaging',
          equipmentRequired: 'Handling gloves and packaging tape',
        },
        {
          roleMatch: 'سائق',
          roleName: 'Delivery Van Drivers',
          skillTag: 'Logistics Transport',
          equipmentRequired: 'Valid standard/commercial driver license',
        },
      ],
    },
  },
};

function detectMissionKey(mission: Mission): string | null {
  const text = `${mission.title} ${mission.description || ''} ${mission.venueName} ${mission.category}`.toLowerCase();
  if (text.includes('بوشاوي') || text.includes('bouchaoui') || text.includes('reboisement') || text.includes('شجرة')) {
    return 'bouchaoui';
  }
  if (text.includes('بليدة') || text.includes('blida') || text.includes('medical') || text.includes('طبي') || text.includes('caravane') || text.includes('أطفال')) {
    return 'medical';
  }
  if (text.includes('براقي') || text.includes('baraki') || text.includes('رمضان') || text.includes('قفف') || text.includes('colis') || text.includes('baskets') || text.includes('food')) {
    return 'ramadan';
  }
  return null;
}

export function getLocalizedMission(mission: Mission, locale: Locale): Mission {
  if (!mission) return mission;
  // Preserve real database mission data, roles, and needs created by organizations
  return mission;
}

export function getLocalizedCategory(category: string, t: (key: string) => string): string {
  if (!category) return '';
  const translated = t(`categories.${category}`);
  if (translated && !translated.startsWith('categories.')) {
    return translated;
  }
  return category;
}

export function getLocalizedUrgency(urgency: string, t: (key: string) => string): string {
  if (!urgency) return '';
  const translated = t(`urgency.${urgency.toLowerCase()}`);
  if (translated && !translated.startsWith('urgency.')) {
    return translated;
  }
  return urgency;
}

export function getLocalizedVolunteerSkill(skill: string, locale: Locale): string {
  const skillMap: Record<string, Record<Locale, string>> = {
    'Graphic Design': {
      ar: '🎨 تصميم جرافيكي وتغطية بصرية',
      fr: '🎨 Design Graphique & Médias',
      en: '🎨 Graphic Design & Visual Media',
    },
    'Drone Videography': {
      ar: '🎥 تصوير درون وتوثيق جوي',
      fr: '🎥 Vidéographie Drone & Prise de Vue',
      en: '🎥 Drone Videography & Aerial Media',
    },
    'Photography': {
      ar: '📸 تصوير فوتوغرافي ميداني',
      fr: '📸 Photographie de Terrain',
      en: '📸 Field Photography',
    },
    'Manual Labor': {
      ar: '⛏️ عمل ميداني وزراعة',
      fr: '⛏️ Travaux Manuels & Plantation',
      en: '⛏️ Field Labor & Planting',
    },
    'First Aid': {
      ar: '🩺 إسعاف أولي ورعاية صحية',
      fr: '🩺 Premiers Secours & Soins',
      en: '🩺 First Aid & Healthcare',
    },
  };

  for (const [key, map] of Object.entries(skillMap)) {
    if (skill.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skill.toLowerCase())) {
      return map[locale] || skill;
    }
  }
  return skill;
}
