import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Globe, ChevronDown, Check } from 'lucide-react-native';
import { useTranslation } from '../context/LanguageContext';
import { MobileLocale, MOBILE_LOCALE_METADATA } from '../locales';
import { civic, civicShadow } from '../theme/civic';

const LANGUAGE_NAMES: Record<MobileLocale, Record<MobileLocale, string>> = {
  ar: { ar: 'العربية', fr: 'الفرنسية', en: 'الإنجليزية' },
  en: { ar: 'Arabic', fr: 'French', en: 'English' },
  fr: { ar: 'Arabe', fr: 'Français', en: 'Anglais' },
};

export default function MobileLanguagePicker() {
  const { locale, setLocale, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);
  const locales: MobileLocale[] = ['ar', 'fr', 'en'];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.trigger}
        accessibilityLabel="Change language"
        activeOpacity={0.8}
      >
        <Globe size={14} color={civic.teal} strokeWidth={2.2} />
        <Text style={styles.triggerText}>{locale.toUpperCase()}</Text>
        <ChevronDown size={12} color={civic.muted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, isRTL ? { left: 16 } : { right: 16 }]}>
            {locales.map((loc) => {
              const selected = loc === locale;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.item, selected && styles.itemActive]}
                  onPress={() => {
                    setLocale(loc);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.itemText, selected && styles.itemTextActive]}>
                    {MOBILE_LOCALE_METADATA[loc].flag}  {LANGUAGE_NAMES[locale][loc]}
                  </Text>
                  {selected ? <Check size={14} color={civic.teal} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.surface,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  triggerText: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: civic.overlay,
  },
  menu: {
    position: 'absolute',
    top: 56,
    width: 180,
    backgroundColor: civic.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: civic.border,
    padding: 6,
    ...civicShadow.raised,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: civic.tealSoft,
  },
  itemText: {
    color: civic.navy,
    fontSize: 12,
    fontWeight: '600',
  },
  itemTextActive: {
    color: civic.teal,
  },
});
