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
import { useTranslation } from '../context/LanguageContext';
import { getBackendUrl } from '../config/apiConfig';

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
  const debounceTimer = useRef<any>(null);

  const getSkillLabel = (item: SkillOption) => {
    if (locale === 'ar') return item.nameAr;
    if (locale === 'fr') return item.nameFr;
    return item.nameEn;
  };

  // Debounced search to backend smart suggestion engine
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
        if (data.ok && data.data) {
          if (data.data.aiSuggestion) {
            const match = AVAILABLE_SKILLS.find((s) => s.id === data.data.aiSuggestion.id);
            setAiSuggestion(match || null);
            setAiExplanation(data.data.aiExplanation || null);
          } else {
            setAiSuggestion(null);
            setAiExplanation(null);
          }
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

  // Local filtering across titles and categories
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerRow, { flexDirection }]}>
              <Text style={[styles.title, { textAlign }]}>{t('auth.selectSkillsBtn')}</Text>
              <View
                style={[
                  styles.countBadge,
                  selectedSkills.length > 0 ? styles.countBadgeValid : styles.countBadgeWarn,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    selectedSkills.length > 0 ? styles.countBadgeTextValid : styles.countBadgeTextWarn,
                  ]}
                >
                  {selectedSkills.length > 0
                    ? `✓ ${selectedSkills.length} ${t('auth.selectedCount')}`
                    : `⚠️ ${t('auth.skillsRequiredBadge')}`}
                </Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { textAlign }]}>{t('auth.skillsHint')}</Text>
          </View>

          {/* Smart AI Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { textAlign }]}
              placeholder={t('auth.smartSearchPlaceholder')}
              placeholderTextColor="#64748B"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#38BDF8" style={{ marginRight: 6 }} />
            ) : searchText.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            {/* AI Smart Suggestion Card (e.g. for "fix walls" -> "Maçonnerie & Bâtiment") */}
            {aiSuggestion && (
              <View style={styles.aiSuggestionBox}>
                <View style={styles.aiHeaderRow}>
                  <Text style={styles.aiTitle}>{t('auth.aiSuggestedTitle')}</Text>
                  <Text style={styles.aiBadge}>AI Engine</Text>
                </View>
                {aiExplanation ? (
                  <Text style={styles.aiExplanationText}>{aiExplanation}</Text>
                ) : (
                  <Text style={styles.aiExplanationText}>{t('auth.aiSuggestionHint')}</Text>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onToggleSkill(aiSuggestion.id)}
                  style={[
                    styles.aiChipButton,
                    selectedSkills.includes(aiSuggestion.id) && styles.aiChipButtonSelected,
                  ]}
                >
                  <Text style={styles.chipIcon}>{aiSuggestion.icon}</Text>
                  <Text style={styles.aiChipText}>{getSkillLabel(aiSuggestion)}</Text>
                  <Text style={styles.aiCheckMark}>
                    {selectedSkills.includes(aiSuggestion.id) ? '✓ Sélectionné' : '+ Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected Skills Chips Strip */}
            {selectedSkills.length > 0 && (
              <View style={styles.selectedSection}>
                <Text style={[styles.sectionLabel, { textAlign }]}>
                  {t('auth.selectedCount').toUpperCase()} ({selectedSkills.length}) :
                </Text>
                <View style={styles.selectedRow}>
                  {selectedSkills.map((id) => {
                    const skill = AVAILABLE_SKILLS.find((s) => s.id === id);
                    return (
                      <TouchableOpacity
                        key={id}
                        activeOpacity={0.7}
                        onPress={() => onToggleSkill(id)}
                        style={styles.selectedPill}
                      >
                        <Text style={styles.selectedPillIcon}>{skill?.icon || '⭐'}</Text>
                        <Text style={styles.selectedPillText}>
                          {skill ? getSkillLabel(skill) : id}
                        </Text>
                        <Text style={styles.selectedPillRemove}>✕</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Standard Canonical Skills Grid */}
            <Text style={[styles.sectionLabel, { textAlign, marginTop: 12 }]}>
              {t('auth.allCategories')} ({filteredSkills.length}) :
            </Text>

            <View style={styles.skillsGrid}>
              {filteredSkills.map((item) => {
                const isSelected = selectedSkills.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => onToggleSkill(item.id)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Text style={styles.chipIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {getSkillLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            disabled={selectedSkills.length === 0}
            style={[
              styles.confirmBtn,
              selectedSkills.length === 0 && styles.confirmBtnDisabled,
            ]}
          >
            <Text style={styles.confirmBtnText}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 18, 0.88)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0A1224',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1E2B4D',
    padding: 20,
    maxHeight: '88%',
  },
  header: {
    marginBottom: 12,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  countBadgeValid: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  countBadgeWarn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  countBadgeTextValid: {
    color: '#10B981',
  },
  countBadgeTextWarn: {
    color: '#F87171',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111A30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#253761',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    paddingVertical: 2,
  },
  clearSearchText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  scrollArea: {
    maxHeight: 380,
  },
  aiSuggestionBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    padding: 12,
    marginBottom: 14,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  aiBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    color: '#BAE6FD',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiExplanationText: {
    color: '#E2E8F0',
    fontSize: 11,
    marginBottom: 10,
  },
  aiChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F274A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  aiChipButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  aiChipText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  aiCheckMark: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: 'bold',
  },
  selectedSection: {
    marginBottom: 12,
    backgroundColor: '#0C1630',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E2B4D',
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  selectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  selectedPillIcon: {
    fontSize: 12,
  },
  selectedPillText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  selectedPillRemove: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: '#111A30',
    borderColor: '#1E2B4D',
  },
  chipSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#60A5FA',
  },
  chipIcon: {
    fontSize: 15,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: '#CBD5E1',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    opacity: 0.6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
