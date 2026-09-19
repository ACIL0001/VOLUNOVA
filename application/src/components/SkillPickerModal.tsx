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
import { Search, Sparkles, X } from 'lucide-react-native';
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
  { id: 'translation_languages', icon: '🗣️', nameEn: 'Translation & Languages', nameFr: 'Traduction & Langues', nameAr: 'ترجمة ولغات', category: 'Communication' },
  { id: 'event_organization', icon: '🤝', nameEn: 'Event Coordination', nameFr: 'Accueil & Coordination', nameAr: 'استقبال وتنظيم فعاليات', category: 'Organisation' },
];

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
  const { t, locale, textAlign, flexDirection } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SkillOption | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const backendUrl = getBackendUrl();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSkillLabel = (item: SkillOption) => {
    if (locale === 'ar') return item.nameAr;
    if (locale === 'fr') return item.nameFr;
    return item.nameEn;
  };

  useEffect(() => {
    if (!searchText.trim() || searchText.trim().length < 2) {
      setAiSuggestion(null);
      setAiExplanation(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${backendUrl}/skills/suggest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchText.trim(), locale }),
        });
        const data = await res.json();
        if (data.ok && data.data?.aiSuggestion) {
          const match = AVAILABLE_SKILLS.find((s) => s.id === data.data.aiSuggestion.id);
          setAiSuggestion(match || null);
          setAiExplanation(data.data.aiExplanation || null);
        } else {
          setAiSuggestion(null);
          setAiExplanation(null);
        }
      } catch (e) {
        console.warn('Smart skill search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchText, locale, backendUrl]);

  const filteredSkills = AVAILABLE_SKILLS.filter((item) => {
    const q = searchText.toLowerCase().trim();
    if (!q) return true;
    return (
      item.nameFr.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.nameAr.includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.headerRow, { flexDirection }]}>
            <Text style={[styles.title, { textAlign }]}>{t('auth.selectSkillsBtn')}</Text>
            <View style={[styles.count, selectedSkills.length ? styles.countOk : styles.countWarn]}>
              <Text style={[styles.countText, { color: selectedSkills.length ? civic.success : civic.danger }]}>
                {selectedSkills.length > 0
                  ? `✓ ${selectedSkills.length} ${t('auth.selectedCount')}`
                  : t('auth.skillsRequiredBadge')}
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { textAlign }]}>{t('auth.skillsHint')}</Text>

          <View style={styles.search}>
            <Search size={16} color={civic.muted} />
            <TextInput
              style={[styles.searchInput, { textAlign }]}
              placeholder={t('auth.smartSearchPlaceholder')}
              placeholderTextColor={civic.muted2}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={civic.teal} />
            ) : searchText.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <X size={14} color={civic.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {aiSuggestion && (
              <View style={styles.aiBox}>
                <View style={styles.aiHead}>
                  <Sparkles size={14} color={civic.teal} />
                  <Text style={styles.aiTitle}>{t('auth.aiSuggestedTitle')}</Text>
                </View>
                <Text style={styles.aiHint}>{aiExplanation || t('auth.aiSuggestionHint')}</Text>
                <TouchableOpacity
                  onPress={() => onToggleSkill(aiSuggestion.id)}
                  style={[
                    styles.aiChip,
                    selectedSkills.includes(aiSuggestion.id) && { backgroundColor: civic.teal },
                  ]}
                >
                  <Text style={[styles.chipText, selectedSkills.includes(aiSuggestion.id) && { color: civic.white }]}>
                    {aiSuggestion.icon} {getSkillLabel(aiSuggestion)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
    maxHeight: '88%',
    ...civicShadow.raised,
  },
  headerRow: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { color: civic.navy, fontSize: 17, fontWeight: '800' },
  count: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  countOk: { backgroundColor: civic.successBg, borderColor: civic.successBorder },
  countWarn: { backgroundColor: civic.dangerBg, borderColor: civic.dangerBorder },
  countText: { fontSize: 10, fontWeight: '800' },
  subtitle: { color: civic.muted, fontSize: 11, marginBottom: 12 },
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
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: civic.navy, fontSize: 13, paddingVertical: 2 },
  scroll: { maxHeight: 380 },
  aiBox: {
    backgroundColor: civic.tealSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.3)',
    padding: 12,
    marginBottom: 12,
  },
  aiHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiTitle: { color: civic.teal, fontSize: 13, fontWeight: '800' },
  aiHint: { color: civic.navySoft, fontSize: 11, marginBottom: 8 },
  aiChip: {
    backgroundColor: civic.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: civic.teal,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 6 },
  chip: {
    backgroundColor: civic.bgSoft,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  chipOn: { backgroundColor: civic.teal, borderColor: civic.teal },
  chipText: { color: civic.navy, fontSize: 12, fontWeight: '600' },
  chipTextOn: { color: civic.white, fontWeight: '800' },
  confirm: {
    marginTop: 14,
    backgroundColor: civic.teal,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmOff: { backgroundColor: civic.border, opacity: 0.7 },
  confirmText: { color: civic.white, fontSize: 13, fontWeight: '800' },
});
