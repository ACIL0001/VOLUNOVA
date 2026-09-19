import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Search, Sparkles, X, Check, Filter } from 'lucide-react-native';
import { useTranslation } from '../context/LanguageContext';
import { getBackendUrl } from '../config/apiConfig';
import { civic, civicShadow } from '../theme/civic';

export interface SkillOption {
  id: string;
  icon: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  category: string;
}

export const CATEGORIES = [
  { id: 'all', labelFr: 'Toutes', labelAr: 'الكل', labelEn: 'All' },
  { id: 'Tech & Digital', labelFr: 'Tech 💻', labelAr: 'تكنولوجيا 💻', labelEn: 'Tech 💻' },
  { id: 'Santé & Soins', labelFr: 'Santé 🩺', labelAr: 'صحة 🩺', labelEn: 'Health 🩺' },
  { id: 'Travaux & BTP', labelFr: 'Travaux 🔨', labelAr: 'أشغال 🔨', labelEn: 'Works 🔨' },
  { id: 'Aide Humanitaire', labelFr: 'Humanitaire 🍲', labelAr: 'مساعدات 🍲', labelEn: 'Aid 🍲' },
  { id: 'Éducation & Jeunesse', labelFr: 'Éducation 📚', labelAr: 'تعليم 📚', labelEn: 'Education 📚' },
  { id: 'Environnement & Nature', labelFr: 'Écologie 🌲', labelAr: 'بيئة 🌲', labelEn: 'Ecology 🌲' },
  { id: 'Logistique & Transport', labelFr: 'Transport 🚗', labelAr: 'نقل 🚗', labelEn: 'Transport 🚗' },
  { id: 'Média & Communication', labelFr: 'Média 📸', labelAr: 'إعلام 📸', labelEn: 'Media 📸' },
  { id: 'Organisation', labelFr: 'Organisation 🤝', labelAr: 'تنظيم 🤝', labelEn: 'Events 🤝' },
];

export const AVAILABLE_SKILLS: SkillOption[] = [
  { id: 'web_development', icon: '💻', nameEn: 'Web Development & IT', nameFr: 'Développement Web & Informatique', nameAr: 'تطوير الويب والمعلوماتية', category: 'Tech & Digital' },
  { id: 'graphic_design', icon: '🎨', nameEn: 'Graphic Design', nameFr: 'Design Graphique & Création', nameAr: 'تصميم جرافيك وإبداع', category: 'Tech & Digital' },
  { id: 'masonry_construction', icon: '🔨', nameEn: 'Masonry & Renovation', nameFr: 'Maçonnerie & Bâtiment', nameAr: 'بناء وترميم وتجديد', category: 'Travaux & BTP' },
  { id: 'first_aid', icon: '🩺', nameEn: 'First Aid & Medical', nameFr: 'Premiers Secours & Médical', nameAr: 'إسعافات أولية وطب', category: 'Santé & Soins' },
  { id: 'driving_logistics', icon: '🚗', nameEn: 'Driving & Logistics', nameFr: 'Conduite & Logistique', nameAr: 'نقل وسياقة ولوجستيك', category: 'Logistique & Transport' },
  { id: 'food_prep_distribution', icon: '🍲', nameEn: 'Food Prep & Distribution', nameFr: 'Restauration & Colis Alimentaires', nameAr: 'تحضير وتوزيع وجبات', category: 'Aide Humanitaire' },
  { id: 'teaching_tutoring', icon: '📚', nameEn: 'Teaching & Tutoring', nameFr: 'Soutien Scolaire & Enseignement', nameAr: 'تعليم وتدريب ودعم مدرسي', category: 'Éducation & Jeunesse' },
  { id: 'reforestation_environment', icon: '🌲', nameEn: 'Reforestation & Environment', nameFr: 'Reboisement & Écologie', nameAr: 'تشجير وبيئة ونظافة', category: 'Environnement & Nature' },
  { id: 'photography_videography', icon: '📸', nameEn: 'Photography & Video', nameFr: 'Photographie & Vidéo', nameAr: 'تصوير وتغطية إعلامية', category: 'Média & Communication' },
  { id: 'translation_languages', icon: '🗣️', nameEn: 'Translation & Languages', nameFr: 'Traduction & Langues', nameAr: 'ترجمة ولغات', category: 'Média & Communication' },
  { id: 'event_organization', icon: '🤝', nameEn: 'Event Coordination', nameFr: 'Accueil & Coordination', nameAr: 'استقبال وتنظيم فعاليات', category: 'Organisation' },
];

function fallbackClientClassify(query: string, locale: string): {
  skill: SkillOption;
  explanation: string;
  isCanonical: boolean;
} {
  const cleanQ = query.trim();
  const q = cleanQ.toLowerCase();

  // Keyword heuristic mapping to standard categories
  const catKeywords: Record<string, { catFr: string; catAr: string; icon: string; keywords: string[] }> = {
    'Travaux & BTP': { catFr: 'Travaux & BTP', catAr: 'أشغال وبناء', icon: '🔨', keywords: ['بناء', 'ترميم', 'صيانة', 'دهان', 'سباكة', 'كهرباء', 'نجارة', 'reparer', 'bricolage', 'murs', 'plomberie', 'travaux', 'peinture'] },
    'Aide Humanitaire': { catFr: 'Aide Humanitaire', catAr: 'مساعدات إنسانية', icon: '🍲', keywords: ['إطعام', 'طبخ', 'وجبات', 'قفة', 'مساعدات', 'توزيع', 'nourriture', 'cuisine', 'repas', 'aide', 'humanitaire'] },
    'Santé & Soins': { catFr: 'Santé & Soins', catAr: 'صحة ورعاية طبية', icon: '🩺', keywords: ['صحة', 'طب', 'طبيب', 'تمريض', 'إسعاف', 'علاج', 'sante', 'soins', 'medical', 'secours', 'urgence'] },
    'Éducation & Jeunesse': { catFr: 'Éducation & Jeunesse', catAr: 'تعليم وتأطير شبابي', icon: '📚', keywords: ['تعليم', 'تدريس', 'دروس', 'دعم', 'مدرسة', 'أطفال', 'cours', 'tutoring', 'formation', 'jeunesse'] },
    'Environnement & Nature': { catFr: 'Environnement & Nature', catAr: 'بيئة وتشجير', icon: '🌲', keywords: ['تشجير', 'غرس', 'بيئة', 'تنظيف', 'شاطئ', 'أشجار', 'arbre', 'nettoyage', 'plage', 'nature', 'recyclage'] },
    'Logistique & Transport': { catFr: 'Logistique & Transport', catAr: 'لوجستيك ونقل', icon: '🚗', keywords: ['نقل', 'سياقة', 'سائق', 'توصيل', 'شاحنة', 'conduite', 'transport', 'logistique', 'livraison'] },
    'Média & Communication': { catFr: 'Média & Communication', catAr: 'إعلام وتواصل', icon: '📸', keywords: ['تصوير', 'فيديو', 'كاميرا', 'ترجمة', 'photo', 'video', 'media', 'redaction', 'reseaux'] },
    'Tech & Digital': { catFr: 'Tech & Digital', catAr: 'تكنولوجيا وبرمجة', icon: '💻', keywords: ['برمجة', 'موقع', 'تطبيق', 'كمبيوتر', 'معلوماتية', 'code', 'web', 'informatique', 'dev', 'software'] },
  };

  let detectedCatFr = 'Organisation & Événements';
  let detectedCatAr = 'تنظيم وفعاليات';
  let detectedIcon = '🤝';
  for (const item of Object.values(catKeywords)) {
    if (item.keywords.some((k) => q.includes(k) || k.includes(q))) {
      detectedCatFr = item.catFr;
      detectedCatAr = item.catAr;
      detectedIcon = item.icon;
      break;
    }
  }

  const chosenCat = locale === 'ar' ? detectedCatAr : detectedCatFr;
  const formattedSkillFr = `${detectedCatFr} (${cleanQ})`;
  const formattedSkillAr = `${detectedCatAr} (${cleanQ})`;
  const finalId = locale === 'ar' ? formattedSkillAr : formattedSkillFr;

  return {
    skill: {
      id: finalId,
      icon: detectedIcon,
      nameFr: formattedSkillFr,
      nameEn: `${detectedCatFr} (${cleanQ})`,
      nameAr: formattedSkillAr,
      category: detectedCatFr,
    },
    explanation: locale === 'ar'
      ? `تم التصنيف الذكي ضمن فئة : ${chosenCat}`
      : `Classé automatiquement dans la catégorie : ${chosenCat}`,
    isCanonical: false,
  };
}

interface SkillPickerModalProps {
  visible: boolean;
  selectedSkills: string[];
  onToggleSkill: (skillId: string) => void;
  onClose: () => void;
}

export default function SkillPickerModal({
  visible,
  selectedSkills,
  onToggleSkill,
  onClose,
}: SkillPickerModalProps) {
  const { t, locale, textAlign, flexDirection, isRTL } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<{
    skill: SkillOption;
    explanation: string;
    isCanonical: boolean;
  } | null>(null);

  const [skillsList, setSkillsList] = useState<SkillOption[]>(AVAILABLE_SKILLS);
  const backendUrl = getBackendUrl();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSkillLabel = (item: SkillOption) => {
    if (locale === 'ar') return item.nameAr;
    if (locale === 'fr') return item.nameFr;
    return item.nameEn;
  };

  const getCategoryLabel = (cat: typeof CATEGORIES[0]) => {
    if (locale === 'ar') return cat.labelAr;
    if (locale === 'fr') return cat.labelFr;
    return cat.labelEn;
  };

  // AI Classification with Gemini via backend + Instant fallback
  const triggerAiClassification = async (query: string) => {
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 2) {
      setAiClassification(null);
      setIsClassifying(false);
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Direct local check for instant 0ms response on exact/substring matches
    const localMatch = AVAILABLE_SKILLS.find(
      (s) =>
        s.nameAr === cleanQ ||
        s.nameAr.includes(cleanQ) ||
        s.nameFr.toLowerCase() === cleanQ.toLowerCase() ||
        s.nameEn.toLowerCase() === cleanQ.toLowerCase()
    );

    if (localMatch) {
      setAiClassification({
        skill: localMatch,
        explanation: locale === 'ar' ? `مطابقة مباشرة مع: ${localMatch.nameAr}` : `Correspond directement à : ${localMatch.nameFr}`,
        isCanonical: true,
      });
      setIsClassifying(false);
      return;
    }

    setIsClassifying(true);

    // 4.5 second hard timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 4500);

    try {
      const res = await fetch(`${backendUrl}/skills/ai-classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanQ, locale }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.ok && data.data?.normalizedSkill) {
        const norm = data.data.normalizedSkill;
        const formattedSkillFr = data.data.formattedSkill || `${norm.category || 'Général'} (${cleanQ})`;
        const formattedSkillAr = data.data.formattedSkillAr || `${data.data.categoryAr || norm.category || 'عام'} (${cleanQ})`;
        const finalId = locale === 'ar' ? formattedSkillAr : formattedSkillFr;

        const normalizedItem: SkillOption = {
          id: finalId,
          icon: norm.icon || '✨',
          nameFr: formattedSkillFr,
          nameEn: formattedSkillFr,
          nameAr: formattedSkillAr,
          category: norm.category,
        };

        setAiClassification({
          skill: normalizedItem,
          explanation: data.data.explanation || '',
          isCanonical: !!data.data.isCanonical,
        });

        // Add to local list if custom normalized
        setSkillsList((prev) => {
          if (prev.some((s) => s.id === normalizedItem.id)) return prev;
          return [normalizedItem, ...prev];
        });
      } else {
        // Fallback to client-side heuristic
        const fb = fallbackClientClassify(cleanQ, locale);
        setAiClassification(fb);
      }
    } catch (e: any) {
      // Network timeout or connection refused: use client-side heuristic
      const fb = fallbackClientClassify(cleanQ, locale);
      setAiClassification(fb);
    } finally {
      clearTimeout(timeoutId);
      setIsClassifying(false);
    }
  };

  // Debounce AI trigger on typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (searchText.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        triggerAiClassification(searchText.trim());
      }, 350);
    } else {
      setAiClassification(null);
      setIsClassifying(false);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchText]);

  const filteredSkills = skillsList.filter((item) => {
    const q = searchText.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!q) return true;
    return (
      item.nameFr.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.nameAr.includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const handleAddAiSkill = (skill: SkillOption) => {
    setSkillsList((prev) => {
      if (prev.some((s) => s.id === skill.id)) return prev;
      return [skill, ...prev];
    });
    if (!selectedSkills.includes(skill.id)) {
      onToggleSkill(skill.id);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={[styles.headerRow, { flexDirection }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { textAlign }]}>{t('auth.selectSkillsBtn')}</Text>
              <Text style={[styles.subtitle, { textAlign }]}>
                {locale === 'ar'
                  ? 'اختر مجالات خبرتك أو صِف ما تتقنه بالذكاء الاصطناعي'
                  : 'Choisissez vos domaines ou décrivez vos compétences avec l’IA'}
              </Text>
            </View>
            <View style={[styles.count, selectedSkills.length ? styles.countOk : styles.countWarn]}>
              <Text style={[styles.countText, { color: selectedSkills.length ? civic.success : civic.danger }]}>
                {selectedSkills.length > 0
                  ? `✓ ${selectedSkills.length} ${t('auth.selectedCount')}`
                  : t('auth.skillsRequiredBadge')}
              </Text>
            </View>
          </View>

          {/* Search & AI Input */}
          <View style={styles.search}>
            <Search size={16} color={civic.muted} />
            <TextInput
              style={[styles.searchInput, { textAlign }]}
              placeholder={
                locale === 'ar'
                  ? 'اكتب مهارتك (مثال: صيانة كهرباء، إطعام خيري، تدريس...)'
                  : 'Décrivez vos compétences (ex: réparer des murs, cuisine collective...)'
              }
              placeholderTextColor={civic.muted2}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            {isClassifying ? (
              <ActivityIndicator size="small" color={civic.teal} />
            ) : searchText.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <X size={15} color={civic.muted} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => triggerAiClassification(searchText)}
                style={styles.aiSparkleBtn}
              >
                <Sparkles size={14} color={civic.teal} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dynamic Gemini AI Result Box */}
          {aiClassification && (
            <View style={styles.aiCard}>
              <View style={styles.aiCardHead}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color={civic.teal} />
                  <Text style={styles.aiBadgeTitle}>
                    {locale === 'ar' ? 'اكتشاف وتصنيف ذكي (Gemini AI)' : 'Détection Intelligente Gemini AI'}
                  </Text>
                </View>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{aiClassification.skill.category}</Text>
                </View>
              </View>

              <Text style={styles.aiExplanationText}>
                {aiClassification.explanation}
              </Text>

              <TouchableOpacity
                onPress={() => handleAddAiSkill(aiClassification.skill)}
                style={[
                  styles.addAiBtn,
                  selectedSkills.includes(aiClassification.skill.id) && styles.addAiBtnOn,
                ]}
              >
                <Text style={[styles.addAiBtnText, selectedSkills.includes(aiClassification.skill.id) && { color: civic.white }]}>
                  {selectedSkills.includes(aiClassification.skill.id) ? '✓ ' : '+ '}
                  {aiClassification.skill.icon} {getSkillLabel(aiClassification.skill)}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Category Filter Horizontal Scroll */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[styles.catChip, isActive && styles.catChipOn]}
                  >
                    <Text style={[styles.catChipText, isActive && styles.catChipTextOn]}>
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Skills Grid */}
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.grid}>
              {filteredSkills.map((item) => {
                const selected = selectedSkills.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onToggleSkill(item.id)}
                    style={[styles.chip, selected && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                      {item.icon} {getSkillLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <TouchableOpacity
            onPress={onClose}
            disabled={selectedSkills.length === 0}
            style={[styles.confirm, selectedSkills.length === 0 && styles.confirmOff]}
          >
            <Text style={styles.confirmText}>
              {selectedSkills.length === 0
                ? t('auth.skillsRequiredBadge')
                : `${t('auth.saveSkills')} (${selectedSkills.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: civic.overlay,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: civic.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: civic.border,
    padding: 18,
    maxHeight: '90%',
    ...civicShadow.raised,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: { color: civic.navy, fontSize: 16, fontWeight: '800' },
  subtitle: { color: civic.muted, fontSize: 11, marginTop: 2, maxWidth: 240 },
  count: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  countOk: { backgroundColor: civic.successBg, borderColor: civic.successBorder },
  countWarn: { backgroundColor: civic.dangerBg, borderColor: civic.dangerBorder },
  countText: { fontSize: 10, fontWeight: '800' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: civic.bgSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: civic.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: civic.navy, fontSize: 12, paddingVertical: 2 },
  aiSparkleBtn: { padding: 4 },
  aiCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.25)',
    padding: 10,
    marginBottom: 8,
  },
  aiCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiBadgeTitle: { color: civic.teal, fontSize: 11, fontWeight: '800' },
  catBadge: { backgroundColor: 'rgba(13,122,111,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { color: civic.teal, fontSize: 9, fontWeight: '800' },
  aiExplanationText: { color: '#0f3d37', fontSize: 11, marginBottom: 8, lineHeight: 15 },
  addAiBtn: {
    backgroundColor: civic.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: civic.teal,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  addAiBtnOn: { backgroundColor: civic.teal },
  addAiBtnText: { color: civic.navy, fontSize: 11, fontWeight: '700' },
  categoryContainer: { marginBottom: 10 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: civic.bgSoft,
    borderWidth: 1,
    borderColor: civic.border,
  },
  catChipOn: {
    backgroundColor: '#e6f4f2',
    borderColor: civic.teal,
  },
  catChipText: { fontSize: 10, fontWeight: '700', color: civic.muted },
  catChipTextOn: { color: civic.teal, fontWeight: '800' },
  scroll: { maxHeight: 300 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingVertical: 4 },
  chip: {
    backgroundColor: civic.bgSoft,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: civic.teal, borderColor: civic.teal },
  chipText: { color: civic.navy, fontSize: 11, fontWeight: '600' },
  chipTextOn: { color: civic.white, fontWeight: '800' },
  confirm: {
    marginTop: 12,
    backgroundColor: civic.teal,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmOff: { backgroundColor: civic.border, opacity: 0.7 },
  confirmText: { color: civic.white, fontSize: 13, fontWeight: '800' },
});
