import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LogBox,
} from 'react-native';

LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Disconnected from Metro',
  'Bundle Splitting – Metro disconnected',
]);
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Compass,
  LogOut,
  MapPin,
  Palette,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  TreePine,
  Users,
  User as UserIcon,
  Zap,
} from 'lucide-react-native';
import { LanguageProvider, useTranslation } from './src/context/LanguageContext';
import MobileLanguagePicker from './src/components/MobileLanguagePicker';
import AuthScreen from './src/components/AuthScreen';
import { AVAILABLE_SKILLS } from './src/components/SkillPickerModal';
import NotificationsModal, { MobileNotification } from './src/components/NotificationsModal';
import MissionCard, { fillPercent, localizeCategory } from './src/components/MissionCard';
import MissionOpsSheet from './src/components/MissionOpsSheet';
import VolunteerProfileView from './src/components/VolunteerProfileView';
import { CivicBadge, CivicCard, CivicProgress, PrimaryButton } from './src/components/ui/Civic';
import { subscribeVolunteerNotifications } from './src/services/mobileSocket';
import {
  registerPushNotifications,
  setupPushNotificationTapListener,
  displayLocalNotification,
} from './src/services/pushService';
import { getBackendUrl } from './src/config/apiConfig';
import { useResponsive } from './src/hooks/useResponsive';
import { civic, civicRadius, civicShadow } from './src/theme/civic';

const BACKEND_URL = getBackendUrl();
const CATEGORIES = ['All', 'Environmental', 'Humanitarian', 'Health', 'Education', 'Technology'];

function VolunovaMobileApp() {
  const { t, isRTL, textAlign, flexDirection, locale } = useTranslation();
  const { pad, contentMaxWidth, logoHeight, tabBarHeight, columns, compact, isPhone } =
    useResponsive();

  const [activeTab, setActiveTab] = useState<'matched' | 'browse' | 'passport' | 'profile'>('matched');
  const [joiningNeedId, setJoiningNeedId] = useState<string | null>(null);
  const [joinedNeedIds, setJoinedNeedIds] = useState<string[]>([]);
  const [impactHours, setImpactHours] = useState(0);
  const [serverOnline, setServerOnline] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [opsMission, setOpsMission] = useState<any | null>(null);
  const [stats, setStats] = useState({
    treesPlanted: 0,
    totalImpactHours: 0,
    volunteersMobilized: 0,
    fillRatePercentage: 0,
  });

  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [toastNotif, setToastNotif] = useState<{
    title: string;
    body: string;
    missionId?: string;
    notifId?: string;
  } | null>(null);

  useEffect(() => {
    if (!toastNotif) return;
    const timer = setTimeout(() => setToastNotif(null), 7000);
    return () => clearTimeout(timer);
  }, [toastNotif]);

  useEffect(() => {
    async function loadSession() {
      try {
        const token = await AsyncStorage.getItem('volunova_auth_token');
        const userJson = await AsyncStorage.getItem('volunova_auth_user');
        if (token && userJson) {
          const u = JSON.parse(userJson);
          setAuthToken(token);
          setCurrentUser({ ...u, _id: u._id || u.id });
          if (u.impactHours !== undefined) setImpactHours(u.impactHours);
          fetchMyApplications(token);
        }
      } catch (e) {
        console.error('Session restore error:', e);
      } finally {
        setAuthLoading(false);
      }
    }
    loadSession();
  }, []);

  const fetchMyApplications = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/missions/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        const needIds = data.data.map((app: any) => app.needId).filter(Boolean);
        setJoinedNeedIds(needIds);
      }
    } catch (e) {
      console.warn('Could not fetch user applications:', e);
    }
  };

  const fetchMissions = async () => {
    setLoadingMissions(true);
    try {
      const res = await fetch(`${BACKEND_URL}/missions`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) setMissions(data.data);
    } catch (e) {
      console.warn('Could not fetch missions from backend:', e);
    } finally {
      setLoadingMissions(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/stats/impact-wall`);
      const data = await res.json();
      if (data.ok && data.data) setStats(data.data);
    } catch {
      // keep zeros
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
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('volunova_auth_token');
    await AsyncStorage.removeItem('volunova_auth_user');
    setAuthToken(null);
    setCurrentUser(null);
    setJoinedNeedIds([]);
  };

  const handleJoinMission = async (missionId?: string, needId?: string, hours: number = 4) => {
    if (!authToken) {
      Alert.alert('Non connecté', 'Veuillez vous connecter pour postuler.');
      return;
    }
    const targetMissionId = missionId || missions[0]?._id;
    const targetNeedId = needId || missions[0]?.needs?.[0]?._id;
    if (!targetMissionId || !targetNeedId) {
      Alert.alert('Information', 'Aucune mission disponible à rejoindre pour le moment.');
      return;
    }
    if (joinedNeedIds.includes(targetNeedId)) return;

    setJoiningNeedId(targetNeedId);
    try {
      const res = await fetch(`${BACKEND_URL}/missions/${targetMissionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ needId: targetNeedId }),
      });
      const data = await res.json();
      if (data.ok) {
        setJoinedNeedIds((prev) => [...prev, targetNeedId]);
        setImpactHours((prev) => prev + hours);
        fetchMissions();
        fetchStats();
        const joinedMissionItem = missions.find((m) => m._id === targetMissionId);
        const missionTitle = joinedMissionItem?.title || 'Mission';
        const successMsg =
          locale === 'ar'
            ? `تم تأكيد تسجيلك في مهمة "${missionTitle}" بنجاح! +${hours} ساعات أثر موثقة.`
            : `Votre inscription à la mission "${missionTitle}" est validée ! +${hours} heures certifiées.`;
        Alert.alert(t('alerts.congrats'), successMsg);
      } else {
        Alert.alert('Information', data.error?.message || 'Ce créneau est déjà pourvu.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur backend.');
    } finally {
      setJoiningNeedId(null);
    }
  };

  const fetchNotifications = async () => {
    if (!authToken) return;
    setLoadingNotifications(true);
    try {
      const res = await fetch(`${BACKEND_URL}/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.ok && data.data) {
        const list = Array.isArray(data.data.notifications)
          ? data.data.notifications
          : Array.isArray(data.data)
          ? data.data
          : [];
        setNotifications(list);
        const unread =
          typeof data.data.unreadCount === 'number'
            ? data.data.unreadCount
            : list.filter((n: any) => !n.readAt).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.warn('Could not fetch notifications:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!authToken) return;
    try {
      await fetch(`${BACKEND_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Could not mark all notifications as read:', e);
    }
  };

  const handleOpenMissionFromNotification = (missionId: string, notifId?: string) => {
    setNotifModalVisible(false);
    if (notifId && authToken) {
      fetch(`${BACKEND_URL}/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    const found = missions.find((m) => m._id === missionId);
    if (found) setOpsMission(found);
    setActiveTab('matched');
  };

  useEffect(() => {
    if (!authToken || !currentUser?._id) return;
    fetchNotifications();
    fetchMyApplications(authToken);
    registerPushNotifications(authToken);

    const cleanupTapListener = setupPushNotificationTapListener((missionId) => {
      handleOpenMissionFromNotification(missionId);
    });

    const cleanupSocket = subscribeVolunteerNotifications(currentUser._id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      const roleName = newNotif?.payload?.roleName || 'Bénévole';
      const missionTitle = newNotif?.payload?.missionTitle || 'Mission';
      const notifTitle = t('notifications.selectedTitle');
      const notifBody = `${t('notifications.selectedBodyPrefix')} "${roleName}" — "${missionTitle}".`;
      setToastNotif({
        title: notifTitle,
        body: notifBody,
        missionId: newNotif?.payload?.missionId,
        notifId: newNotif?._id,
      });
      displayLocalNotification({
        title: notifTitle,
        body: `${notifBody} ${t('notifications.viewMission')}`,
        data: {
          missionId: newNotif?.payload?.missionId,
          needId: newNotif?.payload?.needId,
        },
      });
    });

    return () => {
      cleanupTapListener();
      cleanupSocket();
    };
  }, [authToken, currentUser?._id]);

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.boot, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={civic.teal} />
      </SafeAreaView>
    );
  }

  if (!authToken || !currentUser) {
    return (
      <SafeAreaView style={styles.boot}>
        <StatusBar barStyle="dark-content" backgroundColor={civic.backgroundAlt} />
        <AuthScreen
          onAuthSuccess={(user, token) => {
            setCurrentUser({ ...user, _id: user._id || user.id });
            setAuthToken(token);
            if (user.impactHours !== undefined) setImpactHours(user.impactHours);
            fetchMyApplications(token);
          }}
        />
      </SafeAreaView>
    );
  }

  const initials = currentUser?.name
    ? currentUser.name
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((p: string) => p[0])
        .join('')
        .toUpperCase()
    : 'V';

  const filteredMissions = missions.filter((m) => {
    const matchesCat = selectedCat === 'All' || m.category === selectedCat;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.title?.toLowerCase().includes(q) ||
      m.venueName?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const userSkills: string[] = currentUser?.skills || [];

  // Intelligently compute the best matching mission based on the volunteer's registered skills
  let matchedMission: any = null;
  let primaryNeed: any = null;
  let matchScoreVal = 0;

  if (missions.length > 0) {
    if (userSkills.length > 0) {
      let maxScore = -1;
      for (const m of missions) {
        if (!m.needs || m.needs.length === 0) continue;
        for (const need of m.needs) {
          const tSkill = (need.skillTag || '').toLowerCase().trim();
          const tParts = tSkill.match(/^([^(]+)\s*\((.+)\)$/);
          const tCat = tParts ? tParts[1].trim().toLowerCase() : tSkill;
          const tRaw = tParts ? tParts[2].trim().toLowerCase() : tSkill;

          for (const s of userSkills) {
            const uNorm = (s || '').toLowerCase().trim();
            const uParts = uNorm.match(/^([^(]+)\s*\((.+)\)$/);
            const uCat = uParts ? uParts[1].trim().toLowerCase() : uNorm;
            const uRaw = uParts ? uParts[2].trim().toLowerCase() : uNorm;

            let score = 0;
            if (uNorm === tSkill) score = 96;
            else if (uCat === tCat && tCat.length > 2) score = 90;
            else if (uRaw === tRaw || uNorm.includes(tRaw) || tRaw.includes(uNorm)) score = 85;
            else if (uNorm.includes(tCat) || tCat.includes(uNorm)) score = 75;

            if (score > maxScore) {
              maxScore = score;
              matchedMission = m;
              primaryNeed = need;
              matchScoreVal = score;
            }
          }
        }
      }
      if (maxScore < 50) {
        matchedMission = null;
        primaryNeed = null;
        matchScoreVal = 0;
      }
    } else {
      matchedMission = null;
      primaryNeed = null;
      matchScoreVal = 0;
    }
  }

  const matchedPct = matchedMission ? fillPercent(matchedMission) : 0;
  const matchedJoined = primaryNeed ? joinedNeedIds.includes(primaryNeed._id) : false;

  const earnedBadgesCount =
    (impactHours >= 10 ? 1 : 0) +
    (impactHours >= 25 ? 1 : 0) +
    (impactHours >= 50 ? 1 : 0);

  const impactItems = [
    { icon: Clock, value: `${impactHours}h`, label: t('impact.userHours') },
    { icon: Compass, value: `${joinedNeedIds.length}`, label: t('impact.userMissions') },
    { icon: Sparkles, value: `${userSkills.length}`, label: t('impact.userSkills') },
    { icon: Award, value: `${earnedBadgesCount}`, label: t('impact.userBadges') },
  ];

  return (
    <SafeAreaView style={styles.boot} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={civic.white} />

      {toastNotif && (
        <View style={styles.toastWrap}>
          <TouchableOpacity
            style={styles.toastCard}
            activeOpacity={0.9}
            onPress={() => {
              if (toastNotif.missionId) {
                handleOpenMissionFromNotification(toastNotif.missionId, toastNotif.notifId);
              }
              setToastNotif(null);
            }}
          >
            <Sparkles size={20} color={civic.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{toastNotif.title}</Text>
              <Text style={styles.toastBody} numberOfLines={2}>
                {toastNotif.body}
              </Text>
              <Text style={styles.toastAction}>{t('notifications.viewMission')} →</Text>
            </View>
            <TouchableOpacity onPress={() => setToastNotif(null)} hitSlop={12}>
              <Text style={styles.toastClose}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.header}>
        <View style={[styles.headerTop, { flexDirection, paddingHorizontal: pad }]}>
          <Image
            source={require('./assets/logo.png')}
            style={{ height: Math.max(logoHeight, 48), width: compact ? 132 : 168 }}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <MobileLanguagePicker />
            <TouchableOpacity onPress={() => setNotifModalVisible(true)} style={styles.iconBtn}>
              <Bell size={16} color={civic.muted} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
              <LogOut size={16} color={civic.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.profileRow, { flexDirection, paddingHorizontal: pad }]}>
          <View style={[styles.profileLeft, { flexDirection }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
        </View>
            <View>
              <Text style={[styles.greeting, { textAlign }]}>{t('header.greeting')}</Text>
              <Text style={[styles.userName, { textAlign }]} numberOfLines={1}>
                {currentUser?.name || t('header.userName')}
              </Text>
            </View>
          </View>
          <View style={[styles.hoursPill, { flexDirection }]}>
            <Clock size={12} color={civic.teal} />
            <Text style={styles.hoursText}>
              {impactHours} {t('header.hoursSuffix')}
            </Text>
          </View>
        </View>

              <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: serverOnline ? civic.teal : '#d97706' }]} />
                <Text style={styles.statusText}>
                  {serverOnline ? t('telemetry.online') : t('telemetry.offline')}
                </Text>
        </View>
              </View>

      <ScrollView
        contentContainerStyle={{
          padding: pad,
          paddingBottom: tabBarHeight + 16,
          maxWidth: contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
          gap: 14,
        }}
      >
              {activeTab === 'matched' && (
          <View>
            <View style={styles.impactGrid}>
              {impactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <View key={item.label} style={styles.impactCell}>
                    <Icon size={16} color={civic.teal} />
                    <Text style={styles.impactValue}>{item.value}</Text>
                    <Text style={styles.impactLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.matchBanner}>
              <View style={[styles.bannerHead, { flexDirection }]}>
                <Sparkles size={16} color={civic.teal} />
                <Text style={[styles.bannerTitle, { textAlign }]}>{t('match.bannerTitle')}</Text>
              </View>
              <Text style={[styles.bannerDesc, { textAlign }]}>
                {matchedMission && userSkills.length > 0
                  ? locale === 'ar'
                    ? `تم التوجيه الذكي للمهمة بناءً على مهاراتك في: ${userSkills[0]}`
                    : `Mission sélectionnée selon vos compétences en : ${userSkills[0]}`
                  : userSkills.length > 0
                  ? locale === 'ar'
                    ? 'لم تتوفر مهمة تطابق مهاراتك حالياً. سنخبرك فور توفر احتياج مناسب.'
                    : 'Aucune mission ne correspond à vos compétences pour le moment.'
                  : locale === 'ar'
                  ? 'أضف مهاراتك في ملفك الشخصي لتلقي فرص تطوعية موجهة بدقة.'
                  : 'Ajoutez vos compétences pour recevoir des missions ciblées par l’IA.'}
              </Text>
            </View>

            {matchedMission ? (
              <CivicCard>
                <View style={[styles.cardTop, { flexDirection }]}>
                  <CivicBadge label={localizeCategory(matchedMission.category, t)} />
                  <View style={[styles.matchScore, { flexDirection }]}>
                    <Sparkles size={12} color={civic.teal} />
                    <Text style={styles.matchScoreText}>{matchScoreVal}% {t('ops.match_score')}</Text>
                  </View>
                </View>
                <Text style={[styles.missionTitle, { textAlign }]}>{matchedMission.title}</Text>
                <Text style={[styles.missionOrg, { textAlign }]}>
                  {matchedMission.orgId?.name || t('missions.verifiedOrg')}
                </Text>
                <View style={styles.detailBox}>
                  {primaryNeed && (
                    <Text style={[styles.detailItem, { textAlign }]}>
                      {t('match.roleLabel')}: {primaryNeed.roleName}
                    </Text>
                  )}
                  <View style={[styles.metaLine, { flexDirection }]}>
                    <MapPin size={13} color={civic.teal} />
                    <Text style={styles.detailItem}>{matchedMission.venueName}</Text>
                  </View>
                  <View style={[styles.metaLine, { flexDirection }]}>
                    <Clock size={13} color={civic.navy} />
                    <Text style={styles.detailItem}>
                      {matchedMission.estimatedHoursPerVolunteer || 4} {t('header.hoursSuffix')}
                    </Text>
                  </View>
                </View>
                <View style={[styles.progressLabels, { flexDirection }]}>
                  <Text style={styles.progressLabel}>
                    {t('match.progressLabel')}: {matchedMission.totalSlotsFilled}/
                    {matchedMission.totalSlotsNeeded}
                  </Text>
                  <Text style={styles.progressPct}>{matchedPct}%</Text>
                </View>
                <CivicProgress pct={matchedPct} />
                <View style={{ height: 14 }} />
                {matchedJoined ? (
                  <View style={styles.joinedBox}>
                    <CheckCircle2 size={18} color={civic.teal} />
                    <Text style={styles.joinedTitle}>{t('match.joinedSuccess')}</Text>
                    <Text style={styles.joinedSub}>{t('match.joinedSub')}</Text>
                  </View>
                ) : (
                  <PrimaryButton
                    label={joiningNeedId ? t('match.joining') : t('match.joinBtn')}
                    onPress={() =>
                      handleJoinMission(
                        matchedMission._id,
                        primaryNeed?._id,
                        matchedMission.estimatedHoursPerVolunteer || 4
                      )
                    }
                    loading={!!joiningNeedId}
                    icon={<Sparkles size={15} color="#fff" />}
                  />
                )}
                <View style={{ height: 10 }} />
                <TouchableOpacity onPress={() => setOpsMission(matchedMission)}>
                  <Text style={styles.openOps}>{t('missions.open_ops_room')} →</Text>
                </TouchableOpacity>
              </CivicCard>
            ) : (
              <CivicCard style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Compass size={32} color={civic.borderHover} />
                <Text style={[styles.missionTitle, { textAlign: 'center', marginTop: 10 }]}>
                  {locale === 'ar'
                    ? 'لا توجد مهمة مطابقة لمهاراتك حالياً'
                    : 'Aucune mission ciblée pour le moment'}
                </Text>
                <Text style={[styles.emptyDesc, { textAlign: 'center', marginTop: 4 }]}>
                  {userSkills.length === 0
                    ? locale === 'ar'
                      ? 'سجل مهاراتك من تبويب الملف الشخصي للحصول على مطابقة ذكية.'
                      : 'Enregistrez vos compétences depuis votre profil pour recevoir des suggestions.'
                    : locale === 'ar'
                    ? 'ستصلك إشعارات فورية بمجرد نشر مهمة تتطلب كفاءاتك.'
                    : 'Vous serez notifié dès qu’une association publiera un besoin correspondant.'}
                </Text>
              </CivicCard>
            )}

            <CivicCard style={{ marginTop: 14 }}>
              <Text style={[styles.sectionHeader, { textAlign }]}>{t('match.skillsHeader')}</Text>
              <View style={[styles.skillsRow, { justifyContent: isRTL ? 'flex-end' : 'flex-start' }]}>
                {currentUser?.skills?.length > 0 ? (
                  currentUser.skills.map((s: string) => {
                    const opt = AVAILABLE_SKILLS.find((o) => o.id === s);
                    const label =
                      locale === 'ar' && opt ? opt.nameAr : locale === 'fr' && opt ? opt.nameFr : s;
                    return (
                      <View key={s} style={styles.skillChip}>
                        <Text style={styles.skillText}>
                          {opt ? `${opt.icon} ` : '🎯 '}
                          {label}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={[styles.emptyDesc, { paddingVertical: 4 }]}>
                    {locale === 'ar'
                      ? 'لم تقم بتسجيل أي مهارات بعد.'
                      : 'Aucune compétence enregistrée pour le moment.'}
                  </Text>
                )}
              </View>
            </CivicCard>
          </View>
        )}

              {activeTab === 'browse' && (
          <View>
            <Text style={styles.pageBadge}>{t('browse.badge')}</Text>
            <Text style={[styles.pageTitle, { textAlign }]}>{t('browse.title')}</Text>
            <Text style={[styles.pageSub, { textAlign }]}>{t('browse.subtitle')}</Text>

            <View style={styles.searchBar}>
              <Search size={16} color={civic.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t('browse.search_placeholder')}
                placeholderTextColor={civic.mutedSoft}
                style={[styles.searchInput, { textAlign }]}
              />
              <TouchableOpacity onPress={fetchMissions}>
                <RefreshCw size={16} color={civic.teal} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCat === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCat(cat)}
                      style={[styles.catChip, active && styles.catChipOn]}
                    >
                      <Text style={[styles.catText, active && styles.catTextOn]}>
                        {t(`categories.${cat}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {loadingMissions ? (
              <ActivityIndicator color={civic.teal} style={{ marginTop: 24 }} />
            ) : filteredMissions.length === 0 ? (
              <CivicCard style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Compass size={32} color={civic.borderHover} />
                <Text style={[styles.missionTitle, { textAlign: 'center', marginTop: 8 }]}>
                  {t('browse.no_results_title')}
                </Text>
                <Text style={[styles.emptyDesc, { textAlign: 'center' }]}>
                  {t('browse.no_results_desc')}
                </Text>
              </CivicCard>
            ) : (
              <View style={[styles.grid, columns > 1 && styles.grid2]}>
                {filteredMissions.map((m) => (
                  <View key={m._id} style={columns > 1 ? { width: '48%' } : undefined}>
                    <MissionCard
                      mission={m}
                      t={t}
                      textAlign={textAlign}
                      flexDirection={flexDirection}
                      onOpen={() => setOpsMission(m)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

              {activeTab === 'passport' && (
          <CivicCard>
            <Award size={28} color={civic.teal} style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={styles.passportTitle}>{t('passport.title')}</Text>
            <Text style={styles.passportSub}>{t('passport.subtitle')}</Text>
            <View style={styles.qrBox}>
              <QrCode size={42} color={civic.teal} />
              <Text style={styles.qrTitle}>{t('passport.qrTitle')}</Text>
              <Text style={styles.qrId}>
                ID: VOL-DZ-{(currentUser?._id || currentUser?.id || 'USER').toString().slice(-6).toUpperCase()}
              </Text>
              <Text style={[styles.userName, { textAlign: 'center', marginTop: 6, fontSize: 15 }]}>
                {currentUser?.name || ''}
              </Text>
            </View>
            <Text style={[styles.sectionHeader, { textAlign }]}>{t('passport.badgesHeader')}</Text>
            {impactHours > 0 ? (
              <View style={styles.badgesGrid}>
                {impactHours >= 10 && (
                  <View style={styles.badgeCard}>
                    <TreePine size={22} color={civic.teal} />
                    <Text style={styles.badgeName}>{t('passport.badgeEco')}</Text>
                  </View>
                )}
                {impactHours >= 25 && (
                  <View style={styles.badgeCard}>
                    <Award size={22} color={civic.teal} />
                    <Text style={styles.badgeName}>{t('passport.badgeCivic')}</Text>
                  </View>
                )}
                {impactHours >= 50 && (
                  <View style={styles.badgeCard}>
                    <Zap size={22} color={civic.teal} />
                    <Text style={styles.badgeName}>{t('passport.badgeLeader')}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <Text style={[styles.emptyDesc, { textAlign: 'center' }]}>
                  {t('passport.noBadges')}
                </Text>
                <View style={[styles.badgesGrid, { opacity: 0.4, marginTop: 12 }]}>
                  <View style={styles.badgeCard}>
                    <Text style={{ fontSize: 16 }}>🔒</Text>
                    <Text style={styles.badgeName}>{t('passport.badgeEco')}</Text>
                  </View>
                  <View style={styles.badgeCard}>
                    <Text style={{ fontSize: 16 }}>🔒</Text>
                    <Text style={styles.badgeName}>{t('passport.badgeCivic')}</Text>
                  </View>
                  <View style={styles.badgeCard}>
                    <Text style={{ fontSize: 16 }}>🔒</Text>
                    <Text style={styles.badgeName}>{t('passport.badgeLeader')}</Text>
                  </View>
                </View>
              </View>
            )}
          </CivicCard>
        )}

        {activeTab === 'profile' && (
          <VolunteerProfileView
            user={currentUser}
            token={authToken}
                  impactHours={impactHours}
            t={t}
            locale={locale}
            isRTL={isRTL}
            textAlign={textAlign}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
            onOpenPassport={() => setActiveTab('passport')}
          />
        )}
          </ScrollView>

      <View style={[styles.tabBar, { height: tabBarHeight, paddingBottom: isPhone ? 10 : 12 }]}>
        {(
          [
            { id: 'matched' as const, label: t('tabs.matched'), Icon: Sparkles },
            { id: 'browse' as const, label: t('tabs.browse'), Icon: Compass },
            { id: 'passport' as const, label: t('tabs.passport'), Icon: Award },
            { id: 'profile' as const, label: t('tabs.profile'), Icon: UserIcon },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, active && styles.tabItemOn]}
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.Icon size={18} color={active ? civic.teal : civic.muted} />
              <Text style={[styles.tabLabel, active && styles.tabLabelOn]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <NotificationsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        notifications={notifications}
        loading={loadingNotifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectMission={handleOpenMissionFromNotification}
      />

      <MissionOpsSheet
        visible={!!opsMission}
        mission={opsMission}
        joiningNeedId={joiningNeedId}
        joinedNeedIds={joinedNeedIds}
        onClose={() => setOpsMission(null)}
        onJoin={handleJoinMission}
        t={t}
        isRTL={isRTL}
        textAlign={textAlign}
        flexDirection={flexDirection}
      />
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
  boot: {
    flex: 1,
    backgroundColor: civic.background,
  },
  header: {
    backgroundColor: civic.white,
    borderBottomWidth: 1,
    borderBottomColor: civic.border,
    zIndex: 20,
    overflow: 'visible',
    ...civicShadow.header,
  },
  headerTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: civic.border,
    backgroundColor: civic.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: civic.red,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  profileRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    gap: 8,
  },
  profileLeft: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: civic.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  greeting: {
    color: civic.muted,
    fontSize: 11,
  },
  userName: {
    color: civic.navy,
    fontSize: 14,
    fontWeight: '800',
    maxWidth: 160,
  },
  hoursPill: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.tealSoft,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.25)',
    borderRadius: civicRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hoursText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  impactCell: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: civicRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  impactValue: {
    color: civic.navy,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  impactLabel: {
    color: civic.muted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  matchBanner: {
    backgroundColor: civic.tealSoft,
    borderRadius: civicRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.25)',
    marginBottom: 14,
  },
  bannerHead: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bannerTitle: {
    color: civic.teal,
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  bannerDesc: {
    color: civic.navy,
    fontSize: 12,
    lineHeight: 18,
  },
  cardTop: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchScore: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchScoreText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  missionTitle: {
    color: civic.navy,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  missionOrg: {
    color: civic.muted,
    fontSize: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  detailBox: {
    backgroundColor: civic.backgroundAlt,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: civic.border,
  },
  detailItem: {
    color: civic.navy,
    fontSize: 12,
  },
  metaLine: {
    alignItems: 'center',
    gap: 6,
  },
  progressLabels: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  progressPct: {
    color: civic.teal,
    fontSize: 12,
    fontWeight: '800',
  },
  joinedBox: {
    backgroundColor: civic.tealSoft,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: civic.successBorder,
    gap: 4,
  },
  joinedTitle: {
    color: civic.teal,
    fontSize: 13,
    fontWeight: '800',
  },
  joinedSub: {
    color: civic.navySoft,
    fontSize: 11,
    textAlign: 'center',
  },
  openOps: {
    textAlign: 'center',
    color: civic.teal,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyDesc: {
    color: civic.muted,
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeader: {
    color: civic.navy,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: civic.tealSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.2)',
  },
  skillText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  pageBadge: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pageTitle: {
    color: civic.navy,
    fontSize: 24,
    fontWeight: '800',
  },
  pageSub: {
    color: civic.muted,
    fontSize: 13,
    marginBottom: 14,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: civicRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: civic.navy,
    fontSize: 14,
    paddingVertical: 4,
  },
  catChip: {
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  catChipOn: {
    backgroundColor: civic.navy,
    borderColor: civic.navy,
  },
  catText: {
    color: civic.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  catTextOn: {
    color: '#fff',
  },
  grid: {
    gap: 12,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  passportTitle: {
    color: civic.navy,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  passportSub: {
    color: civic.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  qrBox: {
    backgroundColor: civic.backgroundAlt,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: civic.border,
    marginBottom: 16,
    gap: 6,
  },
  qrTitle: {
    color: civic.teal,
    fontSize: 12,
    fontWeight: '800',
  },
  qrId: {
    color: civic.mutedSoft,
    fontSize: 11,
  },
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  badgeCard: {
    alignItems: 'center',
    gap: 6,
  },
  badgeName: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: civic.white,
    borderTopWidth: 1,
    borderTopColor: civic.border,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...civicShadow.header,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    paddingVertical: 6,
  },
  tabItemOn: {
    backgroundColor: civic.tealSoft,
  },
  tabLabel: {
    color: civic.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabelOn: {
    color: civic.teal,
  },
  toastWrap: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  toastCard: {
    backgroundColor: civic.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: civic.successBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...civicShadow.raised,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: civic.navy,
  },
  toastBody: {
    fontSize: 12,
    color: civic.muted,
    lineHeight: 16,
  },
  toastAction: {
    fontSize: 12,
    fontWeight: '800',
    color: civic.teal,
    marginTop: 2,
  },
  toastClose: {
    color: civic.mutedSoft,
    fontSize: 14,
    fontWeight: '800',
  },
});
