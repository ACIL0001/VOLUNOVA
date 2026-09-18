import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '../context/LanguageContext';
import { MobileLocale, MOBILE_LOCALE_METADATA } from '../locales';

export default function MobileLanguagePicker() {
  const { locale, setLocale } = useTranslation();
  const locales: MobileLocale[] = ['ar', 'fr', 'en'];

  return (
    <View style={styles.container}>
      {locales.map((l) => {
        const isActive = locale === l;
        const meta = MOBILE_LOCALE_METADATA[l];

        return (
          <TouchableOpacity
            key={l}
            onPress={() => setLocale(l)}
            style={[styles.pill, isActive && styles.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{meta.flag}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#070D1E',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#1E2B4D',
    gap: 3,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    gap: 3,
  },
  pillActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  flag: {
    fontSize: 11,
  },
  label: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
