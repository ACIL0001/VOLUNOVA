import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../context/LanguageContext';
import MobileLanguagePicker from './MobileLanguagePicker';
import SkillPickerModal, { AVAILABLE_SKILLS } from './SkillPickerModal';

const BACKEND_URL = 'http://localhost:5000/api';

interface AuthScreenProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { t, textAlign, flexDirection, locale } = useTranslation();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Algiers');
  const [skills, setSkills] = useState<string[]>(['Graphic Design', 'Photography']);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const handleFastDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ahmed@volunova.dz',
          password: 'password123',
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        await AsyncStorage.setItem('volunova_auth_token', json.data.token);
        await AsyncStorage.setItem('volunova_auth_user', JSON.stringify(json.data.user));
        onAuthSuccess(json.data.user, json.data.token);
      } else {
        Alert.alert('Erreur', json.error?.message || 'Impossible de se connecter avec ce compte.');
      }
    } catch (e) {
      Alert.alert('Erreur de connexion', 'Impossible de joindre le serveur API. Vérifiez que le backend est allumé.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre email et mot de passe.');
      return;
    }

    if (tab === 'signup' && !name) {
      Alert.alert('Nom requis', 'Veuillez saisir votre nom complet.');
      return;
    }

    setLoading(true);
    const endpoint = tab === 'signup' ? `${BACKEND_URL}/auth/signup` : `${BACKEND_URL}/auth/login`;
    const payload =
      tab === 'signup'
        ? { name, email, password, role: 'volunteer', skills, city }
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        await AsyncStorage.setItem('volunova_auth_token', json.data.token);
        await AsyncStorage.setItem('volunova_auth_user', JSON.stringify(json.data.user));
        onAuthSuccess(json.data.user, json.data.token);
      } else {
        Alert.alert('Erreur', json.error?.message || 'Identifiants invalides.');
      }
    } catch (err: any) {
      Alert.alert('Connexion', 'Serveur hors ligne ou problème réseau. Utilisez la démo rapide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header Language Picker */}
      <View style={[styles.topBar, { flexDirection }]}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>VOLUNOVA</Text>
        </View>
        <MobileLanguagePicker />
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign }]}>{t('auth.welcomeTitle')}</Text>
        <Text style={[styles.subtitle, { textAlign }]}>{t('auth.welcomeSub')}</Text>

        {/* Fast Demo Access Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleFastDemoLogin}
          style={styles.fastDemoBtn}
          disabled={loading}
        >
          <Text style={styles.fastDemoBtnText}>{t('auth.demoFastLogin')}</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={[styles.tabsWrapper, { flexDirection }]}>
          <TouchableOpacity
            onPress={() => setTab('login')}
            style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === 'login' && styles.tabBtnTextActive]}>
              {t('auth.tabLogin')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab('signup')}
            style={[styles.tabBtn, tab === 'signup' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === 'signup' && styles.tabBtnTextActive]}>
              {t('auth.tabSignup')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          {tab === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { textAlign }]}>{t('auth.nameLabel')}</Text>
              <TextInput
                style={[styles.input, { textAlign }]}
                placeholder={t('auth.namePlaceholder')}
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign }]}>{t('auth.emailLabel')}</Text>
            <TextInput
              style={[styles.input, { textAlign }]}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign }]}>{t('auth.passwordLabel')}</Text>
            <TextInput
              style={[styles.input, { textAlign }]}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {tab === 'signup' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign }]}>{t('auth.cityLabel')}</Text>
                <TextInput
                  style={[styles.input, { textAlign }]}
                  placeholder={t('auth.cityPlaceholder')}
                  placeholderTextColor="#64748B"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              {/* Skills Selector Button */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign }]}>{t('auth.skillsLabel')}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowSkillPicker(true)}
                  style={styles.skillSelectorTrigger}
                >
                  <Text style={styles.skillSelectorText}>
                    {skills.length > 0
                      ? `✓ ${skills.length} ${t('auth.skillsLabel').toLowerCase()}`
                      : t('auth.selectSkillsBtn')}
                  </Text>
                  <Text style={styles.editIcon}>⚙️</Text>
                </TouchableOpacity>

                <View style={styles.skillPreviewChips}>
                  {skills.map((s) => {
                    const found = AVAILABLE_SKILLS.find((o) => o.id === s);
                    return (
                      <View key={s} style={styles.miniChip}>
                        <Text style={styles.miniChipText}>
                          {found ? `${found.icon} ${found.id}` : s}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {tab === 'signup' ? t('auth.signupBtn') : t('auth.loginBtn')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Skill Picker Modal */}
      <SkillPickerModal
        visible={showSkillPicker}
        selectedSkills={skills}
        onToggleSkill={toggleSkill}
        onClose={() => setShowSkillPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#060A12',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  topBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandBadge: {
    backgroundColor: '#0E1D45',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  brandBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#0A1224',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E2B4D',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  fastDemoBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  fastDemoBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabsWrapper: {
    backgroundColor: '#111A30',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#060B18',
    borderWidth: 1,
    borderColor: '#1E2B4D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  skillSelectorTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E1833',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  skillSelectorText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  editIcon: {
    fontSize: 14,
  },
  skillPreviewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  miniChip: {
    backgroundColor: '#15213D',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#1E2B4D',
  },
  miniChipText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
