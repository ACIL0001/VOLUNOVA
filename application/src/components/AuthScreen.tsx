import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AlertCircle,
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react-native';
import { useTranslation } from '../context/LanguageContext';
import MobileLanguagePicker from './MobileLanguagePicker';
import SkillPickerModal, { AVAILABLE_SKILLS } from './SkillPickerModal';
import { getBackendUrl } from '../config/apiConfig';
import { useResponsive } from '../hooks/useResponsive';
import { civic, civicRadius, civicShadow } from '../theme/civic';
import { PrimaryButton } from './ui/Civic';

interface AuthScreenProps {
  onAuthSuccess: (user: any, token: string) => void;
}

function normalizeUser(user: any) {
  if (!user) return user;
  return { ...user, _id: user._id || user.id };
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { t, textAlign, flexDirection, locale } = useTranslation();
  const { pad, contentMaxWidth, logoHeight, width } = useResponsive();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = getBackendUrl();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const persistSession = async (user: any, token: string) => {
    const normalized = normalizeUser(user);
    await AsyncStorage.setItem('volunova_auth_token', token);
    await AsyncStorage.setItem('volunova_auth_user', JSON.stringify(normalized));
    onAuthSuccess(normalized, token);
  };

  const handleFastDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@gmail.com',
          password: 'admin1234',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.ok && json.data) {
        await persistSession(json.data.user, json.data.token);
      } else {
        setError(json.error?.message || 'Impossible de se connecter avec ce compte.');
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e?.name === 'AbortError') {
        Alert.alert(
          "Délai d'attente dépassé (Timeout)",
          `Le serveur (${backendUrl}) met trop de temps à répondre.`
        );
      } else {
        setError(`Impossible de joindre le serveur API (${backendUrl}).`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    if (tab === 'signup') {
      if (!name.trim()) {
        setError(t('auth.nameLabel'));
        return;
      }
      if (!skills || skills.length === 0) {
        Alert.alert(t('auth.skillsRequiredTitle'), t('auth.skillsRequiredMessage'));
        setShowSkillPicker(true);
        return;
      }
    }

    setLoading(true);
    setError(null);
    const endpoint = tab === 'signup' ? `${backendUrl}/auth/signup` : `${backendUrl}/auth/login`;
    const payload =
      tab === 'signup'
        ? { name, email, password, role: 'volunteer', skills, city }
        : { email, password };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.ok && json.data) {
        await persistSession(json.data.user, json.data.token);
      } else {
        setError(json.error?.message || 'Identifiants invalides.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        setError(`Le serveur (${backendUrl}) met trop de temps à répondre.`);
      } else {
        setError(`Impossible de contacter le serveur (${backendUrl}).`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: pad, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.topBar, { flexDirection }]}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ height: Math.max(logoHeight, 56), width: Math.min(168, width * 0.42) }}
            resizeMode="contain"
          />
          <MobileLanguagePicker />
        </View>

        <View style={styles.heading}>
          <Text style={[styles.title, { textAlign }]}>
            {tab === 'login' ? t('auth.welcomeTitle') : t('auth.signupTitle')}
          </Text>
          <Text style={[styles.subtitle, { textAlign }]}>{t('auth.welcomeSub')}</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={[styles.alert, { flexDirection }]}>
              <AlertCircle size={16} color={civic.danger} />
              <Text style={styles.alertText}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.tabs, { flexDirection }]}>
            <TouchableOpacity
              onPress={() => setTab('login')}
              style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
            >
              <User size={14} color={tab === 'login' ? civic.teal : civic.muted} />
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
                {t('auth.tabLogin')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab('signup')}
              style={[styles.tabBtn, tab === 'signup' && styles.tabBtnActive]}
            >
              <HeartHandshake size={14} color={tab === 'signup' ? civic.teal : civic.muted} />
              <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>
                {t('auth.tabSignup')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {tab === 'signup' && (
              <Field
                label={t('auth.nameLabel')}
                icon={<User size={16} color={civic.muted} />}
                placeholder={t('auth.namePlaceholder')}
                value={name}
                onChangeText={setName}
                textAlign={textAlign}
                autoCapitalize="words"
              />
            )}

            <Field
              label={t('auth.emailLabel')}
              icon={<Mail size={16} color={civic.muted} />}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              textAlign={textAlign}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label={t('auth.passwordLabel')}
              icon={<Lock size={16} color={civic.muted} />}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              textAlign={textAlign}
              secureTextEntry={!showPassword}
              trailing={
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                  {showPassword ? (
                    <EyeOff size={16} color={civic.muted} />
                  ) : (
                    <Eye size={16} color={civic.muted} />
                  )}
                </TouchableOpacity>
              }
            />

            {tab === 'signup' && (
              <>
                <Field
                  label={t('auth.cityLabel')}
                  icon={<MapPin size={16} color={civic.muted} />}
                  placeholder={t('auth.cityPlaceholder')}
                  value={city}
                  onChangeText={setCity}
                  textAlign={textAlign}
                />

                <View style={styles.inputGroup}>
                  <View style={[styles.labelRow, { flexDirection }]}>
                    <Text style={styles.label}>{t('auth.skillsLabel')}</Text>
                    <Text style={[styles.skillCount, skills.length > 0 ? styles.ok : styles.req]}>
                      {skills.length > 0
                        ? `✓ ${skills.length} ${t('auth.selectedCount')}`
                        : `* ${t('auth.skillsRequiredBadge')}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setShowSkillPicker(true)}
                    style={[
                      styles.skillTrigger,
                      skills.length > 0 ? styles.skillFilled : styles.skillEmpty,
                    ]}
                  >
                    <Text
                      style={[
                        styles.skillTriggerText,
                        { color: skills.length > 0 ? civic.teal : civic.danger },
                      ]}
                    >
                      {skills.length > 0
                        ? `✓ ${skills.length} ${t('auth.selectedCount')}`
                        : t('auth.selectSkillsBtn')}
                    </Text>
                    <UserPlus size={16} color={skills.length > 0 ? civic.teal : civic.danger} />
                  </TouchableOpacity>
                  {skills.length > 0 && (
                    <View style={styles.chips}>
                      {skills.map((s) => {
                        const found = AVAILABLE_SKILLS.find((o) => o.id === s);
                        const label = found
                          ? locale === 'ar'
                            ? found.nameAr
                            : locale === 'fr'
                            ? found.nameFr
                            : found.nameEn
                          : s;
                        return (
                          <View key={s} style={styles.chip}>
                            <Text style={styles.chipText}>
                              {found ? `${found.icon} ${label}` : s}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </>
            )}

            <PrimaryButton
              label={tab === 'signup' ? t('auth.signupBtn') : t('auth.loginBtn')}
              onPress={handleSubmit}
              loading={loading}
              icon={
                tab === 'signup' ? (
                  <UserPlus size={16} color="#fff" />
                ) : (
                  <User size={16} color="#fff" />
                )
              }
            />
          </View>

          <View style={styles.adminBox}>
            <Text style={styles.adminLabel}>{t('auth.adminAccess')}</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleFastDemoLogin}
              disabled={loading}
              style={styles.adminBtn}
            >
              {loading ? (
                <ActivityIndicator color={civic.purple} />
              ) : (
                <>
                  <ShieldCheck size={16} color={civic.purple} />
                  <Text style={styles.adminBtnText}>{t('auth.demoFastLogin')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <SkillPickerModal
        visible={showSkillPicker}
        selectedSkills={skills}
        onToggleSkill={toggleSkill}
        onClose={() => setShowSkillPicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  icon,
  trailing,
  textAlign,
  ...inputProps
}: {
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  textAlign: 'left' | 'right';
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { textAlign }]}>{label}</Text>
      <View style={styles.inputWrap}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          {...inputProps}
          placeholderTextColor={civic.mutedSoft}
          style={[styles.input, { textAlign }]}
        />
        {trailing ? <View style={styles.inputIcon}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: civic.backgroundAlt,
  },
  container: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    marginBottom: 18,
  },
  title: {
    color: civic.navy,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: civic.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: civic.surface,
    borderRadius: civicRadius.xl,
    borderWidth: 1,
    borderColor: civic.border,
    padding: 20,
    ...civicShadow.raised,
  },
  alert: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: civic.dangerBg,
    borderWidth: 1,
    borderColor: civic.dangerBorder,
    borderRadius: civicRadius.md,
    padding: 12,
    marginBottom: 14,
  },
  alertText: {
    color: civic.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  tabs: {
    backgroundColor: civic.background,
    borderRadius: civicRadius.md,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: civic.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
  },
  tabText: {
    color: civic.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: civic.teal,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  labelRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: civic.backgroundAlt,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: civicRadius.md,
    paddingHorizontal: 4,
  },
  inputIcon: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: civic.navy,
    fontSize: 14,
  },
  skillTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: civicRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  skillEmpty: {
    backgroundColor: civic.dangerBg,
    borderColor: civic.danger,
  },
  skillFilled: {
    backgroundColor: civic.tealSoft,
    borderColor: civic.teal,
  },
  skillTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  skillCount: {
    fontSize: 10,
    fontWeight: '800',
  },
  req: { color: civic.danger },
  ok: { color: civic.teal },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: civic.tealSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.2)',
  },
  chipText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '600',
  },
  adminBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: civic.border,
  },
  adminLabel: {
    textAlign: 'center',
    color: civic.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: civic.purpleBg,
    borderWidth: 1,
    borderColor: civic.purpleBorder,
    borderRadius: civicRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  adminBtnText: {
    color: civic.purple,
    fontSize: 12,
    fontWeight: '700',
  },
});
