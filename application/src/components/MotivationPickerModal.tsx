import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Sparkles, X, Check, Heart, Shield, Users, Award, BookOpen } from 'lucide-react-native';
import { civic, civicRadius, civicShadow } from '../theme/civic';
import { PrimaryButton } from './ui/Civic';
import { getBackendUrl } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MotivationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  token: string | null;
  currentMotivations: string[];
  onSaved: (updatedMotivations: string[]) => void;
  t: (key: string, params?: any) => string;
  locale: string;
  textAlign: 'left' | 'right';
  isRTL: boolean;
}

const MOTIVATION_OPTIONS = [
  { id: 'humanitarian', labelKey: 'motivations.humanitarian', icon: '❤️' },
  { id: 'civic', labelKey: 'motivations.civic', icon: '🌱' },
  { id: 'social', labelKey: 'motivations.social', icon: '🤝' },
  { id: 'skills', labelKey: 'motivations.skills', icon: '💪' },
  { id: 'spiritual', labelKey: 'motivations.spiritual', icon: '🕌' },
];

export default function MotivationPickerModal({
  visible,
  onClose,
  token,
  currentMotivations,
  onSaved,
  t,
  locale,
  textAlign,
  isRTL,
}: MotivationPickerModalProps) {
  const [selected, setSelected] = useState<string[]>(currentMotivations || []);
  const [saving, setSaving] = useState(false);
  const backendUrl = getBackendUrl();

  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivations: selected }),
      });
      const data = await res.json();
      if (data.ok && data.data?.user) {
        await AsyncStorage.setItem('volunova_auth_user', JSON.stringify(data.data.user));
        onSaved(selected);
        onClose();
      }
    } catch (e) {
      console.warn('Could not save motivations:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { textAlign }]}>{t('motivations.title')}</Text>
              <Text style={[styles.subtitle, { textAlign }]}>{t('motivations.subtitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={civic.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {MOTIVATION_OPTIONS.map((opt) => {
              const active = selected.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optRow, active && styles.optRowActive]}
                  onPress={() => toggleOption(opt.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optIcon}>{opt.icon}</Text>
                  <Text style={[styles.optText, active && styles.optTextActive, { textAlign }]}>
                    {t(opt.labelKey)}
                  </Text>
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Check size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 18 }}>
            <PrimaryButton
              label={locale === 'ar' ? 'حفظ الدوافع' : 'Enregistrer mes motivations'}
              onPress={handleSave}
              loading={saving}
              icon={<Sparkles size={15} color="#fff" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 34, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: civicRadius.xl,
    padding: 20,
    ...civicShadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: civic.text,
  },
  subtitle: {
    fontSize: 12,
    color: civic.muted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: civicRadius.md,
    backgroundColor: civic.canvas,
  },
  list: {
    gap: 8,
  },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: civicRadius.md,
    borderWidth: 1,
    borderColor: civic.borderHover,
    backgroundColor: civic.canvas,
  },
  optRowActive: {
    borderColor: civic.teal,
    backgroundColor: civic.tealSurface,
  },
  optIcon: {
    fontSize: 18,
    marginRight: 10,
    marginLeft: 6,
  },
  optText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: civic.text,
  },
  optTextActive: {
    color: civic.teal,
    fontWeight: '700',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: civic.borderHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: civic.teal,
    borderColor: civic.teal,
  },
});
