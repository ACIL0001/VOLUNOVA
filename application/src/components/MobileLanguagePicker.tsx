import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown, Globe } from 'lucide-react-native';
import { useTranslation } from '../context/LanguageContext';
import { MobileLocale, MOBILE_LOCALE_METADATA } from '../locales';
import { civic, civicRadius, civicShadow } from '../theme/civic';

export default function MobileLanguagePicker() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const locales: MobileLocale[] = ['ar', 'fr', 'en'];

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Globe size={14} color={civic.teal} strokeWidth={2.2} />
        <Text style={styles.code}>{locale.toUpperCase()}</Text>
        <ChevronDown size={12} color={civic.muted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {locales.map((l) => {
              const selected = locale === l;
              const meta = MOBILE_LOCALE_METADATA[l];
              return (
                <TouchableOpacity
                  key={l}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => {
                    setLocale(l);
                    setOpen(false);
                  }}
                  style={[styles.item, selected && styles.itemActive]}
                >
                  <Text style={[styles.itemText, selected && styles.itemTextActive]}>
                    {meta.flag}  {l.toUpperCase()} · {meta.nativeName}
                  </Text>
                  {selected ? <Check size={14} color={civic.teal} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: civicRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  code: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: civic.overlay,
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: 20,
  },
  menu: {
    alignSelf: 'flex-start',
    width: 220,
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: civicRadius.md,
    padding: 6,
    ...civicShadow.raised,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  itemActive: {
    backgroundColor: civic.tealSoft,
  },
  itemText: {
    color: civic.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  itemTextActive: {
    color: civic.teal,
  },
});
