import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LanguageProvider, useTranslation } from './src/context/LanguageContext';
import MobileLanguagePicker from './src/components/MobileLanguagePicker';
import AuthScreen from './src/components/AuthScreen';
import { AVAILABLE_SKILLS } from './src/components/SkillPickerModal';
import { getBackendUrl } from './src/config/apiConfig';

const BACKEND_URL = getBackendUrl();

function VolunovaMobileApp() {
  const { t, isRTL, textAlign, flexDirection, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'matched' | 'browse' | 'passport'>('matched');
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [impactHours, setImpactHours] = useState(0);
  const [serverOnline, setServerOnline] = useState(false);

  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(true);

  // Load Persisted Session from AsyncStorage on Startup
  useEffect(() => {
    async function loadSession() {
      try {
        const token = await AsyncStorage.getItem('volunova_auth_token');
        const userJson = await AsyncStorage.getItem('volunova_auth_user');
        if (token && userJson) {
          const u = JSON.parse(userJson);
          setAuthToken(token);
          setCurrentUser(u);
          if (u.impactHours !== undefined) setImpactHours(u.impactHours);
        }
      } catch (e) {
        console.error('Session restore error:', e);
      } finally {
        setAuthLoading(false);
      }
    }
    loadSession();
  }, []);

  const fetchMissions = async () => {
    setLoadingMissions(true);
    try {
      const res = await fetch(`${BACKEND_URL}/missions`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        setMissions(data.data);
      }
    } catch (e) {
      console.warn('Could not fetch missions from backend:', e);
    } finally {
      setLoadingMissions(false);
    }
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') setServerOnline(true);
      })
      .catch(() => setServerOnline(false));

    fetchMissions();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('volunova_auth_token');
    await AsyncStorage.removeItem('volunova_auth_user');
    setAuthToken(null);
    setCurrentUser(null);
    setHasJoined(false);
  };

  const handleJoinMission = async (missionId?: string, needId?: string, hours: number = 4) => {
    if (hasJoined) return;
    if (!authToken) {
      Alert.alert('Non connecté', 'Veuillez vous connecter pour postuler.');
      return;
    }
    setJoining(true);

    try {
      const targetMissionId = missionId || missions[0]?._id;
      const targetNeedId = needId || missions[0]?.needs?.[0]?._id;

      if (!targetMissionId || !targetNeedId) {
        Alert.alert('Information', 'Aucune mission disponible à rejoindre pour le moment.');
        setJoining(false);
        return;
      }

      const res = await fetch(`${BACKEND_URL}/missions/${targetMissionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ needId: targetNeedId }),
      });
      const data = await res.json();
      if (data.ok) {
        setHasJoined(true);
        setImpactHours((prev) => prev + hours);
        fetchMissions();
        Alert.alert(t('alerts.congrats'), t('alerts.joinedMessage'));
      } else {
        Alert.alert('Information', data.error?.message || 'Ce créneau est déjà pourvu.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur backend.');
    } finally {
      setJoining(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </SafeAreaView>
    );
  }

  if (!authToken || !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#060A12" />
        <AuthScreen
          onAuthSuccess={(user, token) => {
            setCurrentUser(user);
            setAuthToken(token);
            if (user.impactHours !== undefined) setImpactHours(user.impactHours);
          }}
        />
      </SafeAreaView>
    );
  }

  const initialLetter = currentUser?.name ? currentUser.name.trim().charAt(0) : 'أ';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060A12" />

      {/* Header with Language Picker & Logout */}
      <View style={[styles.header, { flexDirection }]}>
        <View style={[styles.headerProfile, { flexDirection }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialLetter}</Text>
          </View>
          <View>
            <Text style={[styles.greeting, { textAlign }]}>{t('header.greeting')}</Text>
            <Text style={[styles.userName, { textAlign }]}>{currentUser?.name || t('header.userName')}</Text>
          </View>
        </View>

        {/* Header Actions: Language & Logout */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MobileLanguagePicker />

          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>🏅 {impactHours} {t('header.hoursSuffix')}</Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            accessibilityLabel={t('auth.logout')}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutBtnText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connectivity Status */}
      <View style={styles.statusPillContainer}>
        <View style={[styles.statusDot, { backgroundColor: serverOnline ? '#38BDF8' : '#F59E0B' }]} />
        <Text style={styles.statusPillText}>
          {serverOnline ? t('telemetry.online') : t('telemetry.offline')}
        </Text>
      </View>

      {/* Navigation Tabs */}
      <View style={[styles.tabsContainer, { flexDirection }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'matched' && styles.tabButtonActive]}
          onPress={() => setActiveTab('matched')}
        >
          <Text style={[styles.tabText, activeTab === 'matched' && styles.tabTextActive]}>
            {t('tabs.matched')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'browse' && styles.tabButtonActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}>
            {t('tabs.browse')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'passport' && styles.tabButtonActive]}
          onPress={() => setActiveTab('passport')}
        >
          <Text style={[styles.tabText, activeTab === 'passport' && styles.tabTextActive]}>
            {t('tabs.passport')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'matched' && (
          <View>
            {/* Match Notification Banner */}
            <View style={styles.matchBanner}>
              <Text style={[styles.matchBannerTitle, { textAlign }]}>{t('match.bannerTitle')}</Text>
              <Text style={[styles.matchBannerDesc, { textAlign }]}>{t('match.bannerDesc')}</Text>
            </View>

            {/* Matched Mission Card */}
            {missions.length > 0 ? (
              missions.slice(0, 1).map((mission) => {
                const primaryNeed = mission.needs?.[0];
                const pct = mission.totalSlotsNeeded > 0
                  ? Math.round((mission.totalSlotsFilled / mission.totalSlotsNeeded) * 100)
                  : 0;

                return (
                  <View key={mission._id} style={styles.card}>
                    <View style={[styles.cardTopRow, { flexDirection }]}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{mission.category}</Text>
                      </View>
                      <View style={styles.matchScoreBadge}>
                        <Text style={styles.matchScoreText}>🌟 98% Match</Text>
                      </View>
                    </View>

                    <Text style={[styles.cardTitle, { textAlign }]}>{mission.title}</Text>
                    <Text style={[styles.cardOrg, { textAlign }]}>{mission.orgId?.name || 'Association Citoyenne'}</Text>

                    <View style={styles.detailBox}>
                      {primaryNeed && (
                        <Text style={[styles.detailItem, { textAlign }]}>
                          {t('match.roleLabel')}: <Text style={styles.boldSky}>{primaryNeed.roleName}</Text>
                        </Text>
                      )}
                      <Text style={[styles.detailItem, { textAlign }]}>📍 {mission.venueName}</Text>
                      <Text style={[styles.detailItem, { textAlign }]}>⏱️ {mission.estimatedHoursPerVolunteer || 4} {t('header.hoursSuffix')}</Text>
                    </View>

                    {/* Strict Reserved Green Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressLabels, { flexDirection }]}>
                        <Text style={styles.progressLabelText}>
                          {t('match.progressLabel')}: {mission.totalSlotsFilled}/{mission.totalSlotsNeeded} {t('match.progressStaffed')}
                        </Text>
                        <Text style={styles.progressPctText}>
                          {pct}%
                        </Text>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(5, pct))}%` }]} />
                      </View>
                    </View>

                    {/* 1-Tap Join Button / Reserved Green Accept Box */}
                    {hasJoined ? (
                      <View style={styles.joinedSuccessBox}>
                        <Text style={styles.joinedSuccessText}>{t('match.joinedSuccess')}</Text>
                        <Text style={styles.joinedSubText}>{t('match.joinedSub')}</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => handleJoinMission(mission._id, primaryNeed?._id, mission.estimatedHoursPerVolunteer || 4)}
                        disabled={joining}
                      >
                        <Text style={styles.joinButtonText}>
                          {joining ? t('match.joining') : t('match.joinBtn')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🌱</Text>
                <Text style={[styles.cardTitle, { textAlign: 'center' }]}>
                  {locale === 'ar' ? 'لا توجد مبادرات مطابقة حالياً' : locale === 'fr' ? 'Aucune mission pour le moment' : 'No missions available yet'}
                </Text>
                <Text style={[styles.cardDesc, { textAlign: 'center', marginTop: 4 }]}>
                  {locale === 'ar' ? 'قم بنشر مهمة جديدة من المنصة أو انتظر تسجيل مبادرات جديدة.' : locale === 'fr' ? 'Publiez une initiative depuis le portail web pour la voir apparaître ici.' : 'Publish a mission from the web portal to see it appear here live.'}
                </Text>
              </View>
            )}

            {/* Volunteer Skills */}
            <View style={styles.card}>
              <Text style={[styles.sectionHeader, { textAlign }]}>{t('match.skillsHeader')}</Text>
              <View style={[styles.skillsRow, { justifyContent: isRTL ? 'flex-end' : 'flex-start', flexWrap: 'wrap', gap: 6 }]}>
                {currentUser?.skills && currentUser.skills.length > 0 ? (
                  currentUser.skills.map((s: string) => {
                    const opt = AVAILABLE_SKILLS.find((o) => o.id === s);
                    const label =
                      locale === 'ar' && opt ? opt.nameAr : locale === 'fr' && opt ? opt.nameFr : s;
                    return (
                      <View key={s} style={styles.skillChip}>
                        <Text style={styles.skillText}>
                          {opt ? `${opt.icon} ` : ''}
                          {label}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <>
                    <View style={styles.skillChip}><Text style={styles.skillText}>{t('match.skillDesign')}</Text></View>
                    <View style={styles.skillChip}><Text style={styles.skillText}>{t('match.skillDrone')}</Text></View>
                    <View style={styles.skillChip}><Text style={styles.skillText}>{t('match.skillPhoto')}</Text></View>
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'browse' && (
          <View>
            {missions.length > 0 ? (
              missions.map((m) => {
                const pct = m.totalSlotsNeeded > 0
                  ? Math.round((m.totalSlotsFilled / m.totalSlotsNeeded) * 100)
                  : 0;
                return (
                  <View key={m._id} style={styles.card}>
                    <View style={[styles.cardTopRow, { flexDirection }]}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{m.category}</Text>
                      </View>
                      <Text style={{ color: '#94A3B8', fontSize: 11 }}>📍 {m.venueName}</Text>
                    </View>
                    <Text style={[styles.cardTitle, { textAlign }]}>{m.title}</Text>
                    <Text style={[styles.cardDesc, { textAlign }]} numberOfLines={3}>{m.description}</Text>

                    <View style={styles.progressContainer}>
                      <View style={[styles.progressLabels, { flexDirection }]}>
                        <Text style={styles.progressLabelText}>{m.totalSlotsFilled}/{m.totalSlotsNeeded} {t('match.progressStaffed')}</Text>
                        <Text style={styles.progressPctText}>{pct}%</Text>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(5, pct))}%` }]} />
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
                <Text style={[styles.cardTitle, { textAlign: 'center' }]}>
                  {locale === 'ar' ? 'سجل المبادرات فارغ' : locale === 'fr' ? 'Aucune mission publiée' : 'No published missions'}
                </Text>
                <Text style={[styles.cardDesc, { textAlign: 'center', marginTop: 4 }]}>
                  {locale === 'ar' ? 'سوف تظهر المبادرات هنا بمجرد إنشائها عبر لوحة التحكم.' : locale === 'fr' ? 'Les initiatives créées apparaîtront ici en temps réel.' : 'Created initiatives will appear here in real time.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'passport' && (
          <View style={styles.card}>
            <Text style={styles.passportTitle}>{t('passport.title')}</Text>
            <Text style={styles.passportSub}>{t('passport.subtitle')}</Text>

            <View style={styles.qrSimulation}>
              <Text style={styles.qrText}>{t('passport.qrTitle')}</Text>
              <Text style={styles.qrId}>{t('passport.qrId')}</Text>
            </View>

            <Text style={[styles.sectionHeader, { textAlign }]}>{t('passport.badgesHeader')}</Text>
            <View style={styles.badgesGrid}>
              <View style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>🌲</Text>
                <Text style={styles.badgeName}>{t('passport.badgeEco')}</Text>
              </View>
              <View style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>🎨</Text>
                <Text style={styles.badgeName}>{t('passport.badgeArt')}</Text>
              </View>
              <View style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>⚡</Text>
                <Text style={styles.badgeName}>{t('passport.badgeSpeed')}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <VolunovaMobileApp />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060A12',
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2B4D',
    backgroundColor: '#0A1224',
    gap: 6,
  },
  headerProfile: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#60A5FA',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 11,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  badgeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  badgeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    fontSize: 12,
  },
  statusPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    backgroundColor: '#0C1630',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusPillText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0C1630',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2B4D',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: '#3B82F6',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#93C5FD',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  matchBanner: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    marginBottom: 16,
  },
  matchBannerTitle: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchBannerDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
  },
  boldSky: {
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#0C1630',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E2B4D',
    marginBottom: 16,
  },
  cardTopRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
  },
  categoryText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: 'bold',
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  matchScoreText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 21,
    marginBottom: 4,
  },
  cardOrg: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
  detailBox: {
    backgroundColor: '#060A12',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#15213D',
  },
  detailItem: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  joinButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: '#060A12',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#15213D',
  },
  progressLabels: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabelText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  progressPctText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#15213D',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  joinedSuccessBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  joinedSuccessText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinedSubText: {
    color: '#6EE7B7',
    fontSize: 11,
    textAlign: 'center',
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#15213D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2B4D',
  },
  skillText: {
    color: '#93C5FD',
    fontSize: 11,
  },
  passportTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  passportSub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 14,
  },
  qrSimulation: {
    backgroundColor: '#060A12',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2B4D',
    marginBottom: 16,
  },
  qrText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  qrId: {
    color: '#64748B',
    fontSize: 10,
  },
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  badgeCard: {
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: {
    fontSize: 26,
  },
  badgeName: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
});
