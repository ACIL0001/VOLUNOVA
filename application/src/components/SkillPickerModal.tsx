import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from '../context/LanguageContext';

export interface SkillOption {
  id: string;
  icon: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
}

export const AVAILABLE_SKILLS: SkillOption[] = [
  { id: 'Graphic Design', icon: '🎨', nameEn: 'Graphic Design', nameFr: 'Design Graphique', nameAr: 'تصميم جرافيك' },
  { id: 'Drone Videography', icon: '🎥', nameEn: 'Drone Videography', nameFr: 'Vidéographie Drone', nameAr: 'تصوير درون' },
  { id: 'Photography', icon: '📸', nameEn: 'Photography', nameFr: 'Photographie', nameAr: 'تصوير فوتوغرافي' },
  { id: 'First Aid', icon: '🩺', nameEn: 'First Aid & Medical', nameFr: 'Premiers Secours & Médical', nameAr: 'إسعافات أولية وطب' },
  { id: 'Logistics', icon: '🚗', nameEn: 'Driving & Logistics', nameFr: 'Conduite & Logistique', nameAr: 'نقل ولوجستيك' },
  { id: 'Reforestation', icon: '🌲', nameEn: 'Forestry & Planting', nameFr: 'Reboisement & Plantation', nameAr: 'تشجير وزراعة' },
  { id: 'Food Relief', icon: '📦', nameEn: 'Packaging & Aid', nameFr: 'Colis & Tri Alimentaire', nameAr: 'فرز وتوزيع مساعدات' },
  { id: 'Education', icon: '📚', nameEn: 'Tutoring & Teaching', nameFr: 'Soutien Scolaire', nameAr: 'تعليم وتدريب' },
  { id: 'Technology', icon: '💻', nameEn: 'Tech & Web', nameFr: 'Tech & Informatique', nameAr: 'برمجة وتكنولوجيا' },
  { id: 'Translation', icon: '🗣️', nameEn: 'Translation', nameFr: 'Traduction & Langues', nameAr: 'ترجمة ولغات' },
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
  const { t, locale, textAlign } = useTranslation();

  const getSkillLabel = (item: SkillOption) => {
    if (locale === 'ar') return item.nameAr;
    if (locale === 'fr') return item.nameFr;
    return item.nameEn;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={[styles.title, { textAlign }]}>
              {t('auth.selectSkillsBtn')}
            </Text>
            <Text style={[styles.subtitle, { textAlign }]}>
              {t('auth.skillsHint')}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.skillsGrid}>
            {AVAILABLE_SKILLS.map((item) => {
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
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmBtnText}>{t('auth.saveSkills')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 18, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0A1224',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1E2B4D',
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
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
    fontSize: 16,
  },
  chipText: {
    fontSize: 13,
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
    marginTop: 20,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
