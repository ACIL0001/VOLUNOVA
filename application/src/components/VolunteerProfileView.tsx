import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Award,
  Sparkles,
  Edit3,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  Save,
  X,
  Share2,
  Heart,
  Users,
  Camera,
  Zap,
} from 'lucide-react-native';
import { Share } from 'react-native';
import { civic, civicRadius, civicShadow } from '../theme/civic';
import { CivicCard, PrimaryButton } from './ui/Civic';
import SkillPickerModal, { AVAILABLE_SKILLS } from './SkillPickerModal';
import MyImpactCardModal from './MyImpactCardModal';
import MotivationPickerModal from './MotivationPickerModal';
import SquadModal from './SquadModal';
import { getBackendUrl } from '../config/apiConfig';

interface VolunteerProfileViewProps {
  user: any;
  token: string | null;
  impactHours: number;
  t: (key: string, params?: any) => string;
  locale: string;
  isRTL: boolean;
  textAlign: 'left' | 'right';
  onUpdateUser: (updatedUser: any) => void;
  onLogout: () => void;
  onOpenPassport: () => void;
}

export default function VolunteerProfileView({
  user,
  token,
  impactHours,
  t,
  locale,
  isRTL,
  textAlign,
  onUpdateUser,
  onLogout,
  onOpenPassport,
}: VolunteerProfileViewProps) {
  const backendUrl = getBackendUrl();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [skillPickerVisible, setSkillPickerVisible] = useState(false);
  const [impactCardVisible, setImpactCardVisible] = useState(false);
  const [motivationPickerVisible, setMotivationPickerVisible] = useState(false);
  const [squadModalVisible, setSquadModalVisible] = useState(false);

  // Exactly the volunteer registration fields: name, city, skills (email is read-only)
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setCity(user?.city || '');
    setSkills(user?.skills || []);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Attention', 'Le nom complet est requis.');
      return;
    }

    if (skills.length === 0) {
      Alert.alert('Attention', 'Au moins une compétence est requise.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim(),
          skills,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data?.user) {
        const updated = json.data.user;
        await AsyncStorage.setItem('volunova_auth_user', JSON.stringify(updated));
        onUpdateUser(updated);
        setEditModalVisible(false);
        Alert.alert('Succès', 'Votre profil a été mis à jour avec succès.');
      } else {
        Alert.alert('Erreur', json.error?.message || 'Impossible de mettre à jour le profil.');
      }
    } catch {
      Alert.alert('Erreur', 'Serveur inaccessible pour la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLogout = () => {
    Alert.alert(
      locale === 'ar' ? 'تسجيل الخروج' : 'Déconnexion',
      locale === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: locale === 'ar' ? 'إلغاء' : 'Annuler', style: 'cancel' },
        { text: locale === 'ar' ? 'خروج' : 'Déconnexion', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const hasHistory = (user?.impactHours || impactHours || 0) > 0;
  const reliability =
    typeof user?.reliabilityScore === 'number' && user.reliabilityScore > 0
      ? user.reliabilityScore
      : hasHistory
      ? 100
      : null;
  const totalHours = user?.impactHours || impactHours || 0;

  const tierKey = user?.statusTier || 'level_1_new';
  const tierLabel =
    tierKey === 'level_5_impact_maker'
      ? t('recognition.level5')
      : tierKey === 'level_4_leader'
      ? t('recognition.level4')
      : tierKey === 'level_3_trusted'
      ? t('recognition.level3')
      : tierKey === 'level_2_active'
      ? t('recognition.level2')
      : t('recognition.level1');

  const tierPerks =
    tierKey === 'level_5_impact_maker'
      ? [
          locale === 'ar' ? 'قيادة تحديات مجتمعية كبرى على مستوى البلديات' : 'Diriger les grands défis citoyens municipaux',
          locale === 'ar' ? 'إرشاد وتأطير قادة الفرق والمجموعات' : 'Mentorer les nouveaux coordinateurs et squads',
          locale === 'ar' ? 'الظهور الدائم في حائط الأثر الوطني' : 'Visibilité d’honneur sur le Mur de l’Impact',
        ]
      : tierKey === 'level_4_leader'
      ? [
          locale === 'ar' ? 'إنشاء وتنسيق مبادرات ميدانية بإشراف الجمعيات' : 'Coordonner des initiatives locales',
          locale === 'ar' ? 'تأكيد حضور المتطوعين عبر فحص QR' : 'Valider la présence des bénévoles par QR',
          locale === 'ar' ? 'توزيع الأدوار وتوجيه الفرق الشبابية' : 'Attribuer les rôles et guider les équipes',
        ]
      : tierKey === 'level_3_trusted'
      ? [
          locale === 'ar' ? 'تنسيق المتطوعين في الميدان كمسؤول فرقة' : 'Coordonner les bénévoles sur le terrain',
          locale === 'ar' ? 'أولوية الوصول إلى مهام الطوارئ والإغاثة' : 'Accès prioritaire aux missions d’urgence',
          locale === 'ar' ? 'إرسال تقديرات الشكر لزملائك في الميدان' : 'Envoyer des remerciements d’équipe',
        ]
      : tierKey === 'level_2_active'
      ? [
          locale === 'ar' ? 'الانضمام للمهام ذات المقاعد المحدودة' : 'Accéder aux missions à places limitées',
          locale === 'ar' ? 'إنشاء مجموعة تطوعية (Squad) ودعوة أصدقائك' : 'Créer votre Squad de bénévoles',
          locale === 'ar' ? 'المساهمة في شريط تقدم تحدي الحومة' : 'Contribuer à la jauge du Défi de Quartier',
        ]
      : [
          locale === 'ar' ? 'الانضمام إلى المهام التطوعية المفتوحة' : 'Rejoindre les missions citoyennes ouvertes',
          locale === 'ar' ? 'الحصول على جواز السفر المدني ورمز QR' : 'Passeport civique et QR de terrain',
          locale === 'ar' ? 'تحديد دوافعك واهتماماتك المجتمعية' : 'Personnaliser vos motivations',
        ];

  const handleBringFriend = async () => {
    const certId = `VOL-DZ-${(user?._id || user?.id || 'USER').toString().slice(-6).toUpperCase()}`;
    const text =
      locale === 'ar'
        ? `عجبتك المهمة؟ 👥 جيب صاحبك للمهمة القادمة في فولونوفا (VOLUNOVA)!\nسجل معي عبر الرابط واكسب أثرك الميداني: https://volunova.dz/join?ref=${certId}`
        : `Rejoins-moi sur VOLUNOVA pour la prochaine mission citoyenne ! 👥\nInscris-toi via ce lien : https://volunova.dz/join?ref=${certId}`;
    try {
      await Share.share({ message: text });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header Card */}
      <CivicCard style={styles.heroCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
            </Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.userName, { textAlign }]} numberOfLines={1}>
                {user?.name || (locale === 'ar' ? 'متطوع مسجل' : 'Bénévole VOLUNOVA')}
              </Text>
            </View>
            <Text style={[styles.userEmail, { textAlign }]} numberOfLines={1}>
              {user?.email}
            </Text>
            <View style={styles.locationPill}>
              <MapPin size={11} color={civic.teal} />
              <Text style={styles.locationText}>
                {user?.city || (locale === 'ar' ? 'المدينة غير محددة' : 'Ville non renseignée')}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleOpenEdit} style={styles.editIconBtn}>
            <Edit3 size={16} color={civic.teal} />
          </TouchableOpacity>
        </View>

        {/* Reliability Score Pill */}
        <View style={styles.scoreRow}>
          <View style={styles.scorePill}>
            <ShieldCheck size={14} color={civic.teal} />
            <Text style={styles.scoreText}>
              {reliability !== null
                ? `${locale === 'ar' ? 'مؤشر الالتزام :' : 'Indice d’engagement :'} ${reliability}%`
                : locale === 'ar'
                ? 'عضو جديد (في انتظار أول مهمة)'
                : 'Nouveau bénévole'}
            </Text>
          </View>
        </View>
      </CivicCard>

      {/* Impact Telemetry Row */}
      <View style={styles.statsRow}>
        <CivicCard style={styles.statCard}>
          <Clock size={20} color={civic.teal} />
          <Text style={styles.statNumber}>{totalHours}h</Text>
          <Text style={styles.statLabel}>
            {locale === 'ar' ? 'ساعات التأثير' : 'Heures d’impact'}
          </Text>
        </CivicCard>

        <CivicCard style={styles.statCard}>
          <Sparkles size={20} color={civic.teal} />
          <Text style={styles.statNumber}>{user?.skills?.length || 0}</Text>
          <Text style={styles.statLabel}>
            {locale === 'ar' ? 'المهارات المعتمدة' : 'Compétences'}
          </Text>
        </CivicCard>

        <CivicCard style={styles.statCard}>
          <Award size={20} color={civic.teal} />
          <Text style={styles.statNumber}>{hasHistory ? '100%' : '0%'}</Text>
          <Text style={styles.statLabel}>
            {locale === 'ar' ? 'حضور مؤكد' : 'Assiduité'}
          </Text>
        </CivicCard>
      </View>

      {/* Registered Skills (From Registration) */}
      <CivicCard style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {locale === 'ar' ? 'مهاراتي المعتمدة' : 'Mes compétences validées'}
          </Text>
          <TouchableOpacity onPress={() => setSkillPickerVisible(true)}>
            <Text style={styles.editSkillsLink}>
              {locale === 'ar' ? 'إضافة / تعديل +' : 'Gérer avec l’IA +'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.skillsWrap, { justifyContent: isRTL ? 'flex-end' : 'flex-start' }]}>
          {user?.skills && user.skills.length > 0 ? (
            user.skills.map((s: string) => {
              const opt = AVAILABLE_SKILLS.find((o) => o.id === s);
              const label =
                locale === 'ar' && opt ? opt.nameAr : locale === 'fr' && opt ? opt.nameFr : s;
              return (
                <View key={s} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>
                    {opt?.icon ? `${opt.icon} ` : '✨ '}
                    {label}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptySkillsText}>
              {locale === 'ar'
                ? 'لم تسجل مهارات بعد. اضغط على إدارة المهارات لإضافتها بالذكاء الاصطناعي.'
                : 'Aucune compétence enregistrée. Utilisez l’assistant IA pour en ajouter.'}
            </Text>
          )}
        </View>
      </CivicCard>

      {/* 1. Status Tier & Privileges Card (Levels 1-5) */}
      <CivicCard style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{t('recognition.statusTitle')}</Text>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillText}>{tierLabel}</Text>
          </View>
        </View>

        <View style={styles.perksList}>
          {tierPerks.map((perk, idx) => (
            <View key={idx} style={[styles.perkRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <CheckCircle2 size={13} color={civic.teal} />
              <Text style={[styles.perkText, { textAlign }]}>{perk}</Text>
            </View>
          ))}
        </View>
      </CivicCard>

      {/* 2. Human Appreciations from Real People */}
      <CivicCard style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Heart size={16} color="#f43f5e" fill="#f43f5e" />
          <Text style={[styles.sectionTitle, { textAlign, marginBottom: 0 }]}>
            {t('recognition.thankYouSection')}
          </Text>
        </View>

        <View style={styles.appreciationsRow}>
          <View style={styles.appreciationChip}>
            <Text style={styles.appreciationVal}>{user?.appreciationsReceived?.thankYou || 0}</Text>
            <Text style={styles.appreciationLbl}>{t('recognition.thankYouCount')}</Text>
          </View>
          <View style={styles.appreciationChip}>
            <Text style={styles.appreciationVal}>{user?.appreciationsReceived?.teamSpirit || 0}</Text>
            <Text style={styles.appreciationLbl}>{t('recognition.teamSpiritCount')}</Text>
          </View>
          <View style={styles.appreciationChip}>
            <Text style={styles.appreciationVal}>{user?.appreciationsReceived?.rapidResponder || 0}</Text>
            <Text style={styles.appreciationLbl}>{t('recognition.rapidResponderCount')}</Text>
          </View>
          <View style={styles.appreciationChip}>
            <Text style={styles.appreciationVal}>{user?.referralsCompletedCount || 0}</Text>
            <Text style={styles.appreciationLbl}>{t('recognition.builderCount')}</Text>
          </View>
        </View>
      </CivicCard>

      {/* 3. Social & Civic Actions Hub */}
      <View style={{ marginTop: 12, gap: 10 }}>
        {/* My Impact Card */}
        <TouchableOpacity onPress={() => setImpactCardVisible(true)} style={styles.actionBtnPrimary}>
          <Camera size={18} color="#fff" />
          <Text style={styles.actionBtnPrimaryText}>{t('recognition.myImpactCardBtn')}</Text>
        </TouchableOpacity>

        {/* Squads */}
        <TouchableOpacity onPress={() => setSquadModalVisible(true)} style={styles.actionBtnSecondary}>
          <Users size={18} color={civic.teal} />
          <Text style={styles.actionBtnSecondaryText}>{t('squads.title')}</Text>
        </TouchableOpacity>

        {/* Motivations */}
        <TouchableOpacity onPress={() => setMotivationPickerVisible(true)} style={styles.actionBtnSecondary}>
          <Sparkles size={18} color={civic.teal} />
          <Text style={styles.actionBtnSecondaryText}>{t('motivations.title')}</Text>
        </TouchableOpacity>

        {/* Bring Your Friend */}
        <TouchableOpacity onPress={handleBringFriend} style={styles.bringFriendBtn}>
          <Heart size={16} color="#0d7a6f" />
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <Text style={[styles.bringFriendTitle, { textAlign }]}>{t('recognition.bringFriendTitle')}</Text>
            <Text style={[styles.bringFriendSub, { textAlign }]}>{t('recognition.bringFriendSub')}</Text>
          </View>
          <Share2 size={16} color="#0d7a6f" />
        </TouchableOpacity>
      </View>

      {/* Passport Quick CTA */}
      <TouchableOpacity onPress={onOpenPassport} style={styles.passportBtn}>
        <QrCode size={20} color={civic.teal} />
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Text style={[styles.passportBtnTitle, { textAlign }]}>
            {locale === 'ar' ? 'جواز السفر المدني الموثق' : 'Passeport Civique & Badges'}
          </Text>
          <Text style={[styles.passportBtnSub, { textAlign }]}>
            {locale === 'ar' ? 'اعرض رمز QR للمشاركة في المهام' : 'Consultez votre QR code et vos attestations'}
          </Text>
        </View>
        <Text style={styles.arrowText}>→</Text>
      </TouchableOpacity>

      {/* Logout Action */}
      <TouchableOpacity onPress={handleConfirmLogout} style={styles.logoutBtn}>
        <LogOut size={16} color={civic.danger} />
        <Text style={styles.logoutText}>
          {locale === 'ar' ? 'تسجيل الخروج من الحساب' : 'Se déconnecter de la session'}
        </Text>
      </TouchableOpacity>

      {/* Edit Profile Modal (Strictly Registration Fields: Name, City, Skills) */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {locale === 'ar' ? 'تعديل الملف الشخصي' : 'Modifier mon profil'}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={18} color={civic.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>
                {locale === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.modalInput}
                placeholder="Votre nom"
              />

              <Text style={styles.inputLabel}>
                {locale === 'ar' ? 'البريد الإلكتروني (الحساب)' : 'Adresse Email (Compte)'}
              </Text>
              <TextInput
                value={user?.email || ''}
                editable={false}
                style={[styles.modalInput, { backgroundColor: '#f1f5f9', color: '#64748b' }]}
              />

              <Text style={styles.inputLabel}>
                {locale === 'ar' ? 'الولاية / المدينة *' : 'Ville / Wilaya *'}
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                style={styles.modalInput}
                placeholder="Alger, Oran, Blida..."
              />

              <TouchableOpacity
                onPress={() => setSkillPickerVisible(true)}
                style={styles.manageSkillsBtn}
              >
                <Sparkles size={15} color={civic.teal} />
                <Text style={styles.manageSkillsBtnText}>
                  {locale === 'ar'
                    ? `تعديل المهارات بالذكاء الاصطناعي (${skills.length})`
                    : `Gérer les compétences avec l'IA (${skills.length})`}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={saving}
              style={styles.modalSaveBtn}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Save size={16} color="#fff" />
                  <Text style={styles.modalSaveBtnText}>
                    {locale === 'ar' ? 'حفظ التعديلات' : 'Enregistrer les modifications'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Skill Picker with AI Integration */}
      <SkillPickerModal
        visible={skillPickerVisible}
        selectedSkills={skills}
        onToggleSkill={toggleSkill}
        onClose={() => setSkillPickerVisible(false)}
      />

      {/* 1. My Impact Card Share Modal */}
      <MyImpactCardModal
        visible={impactCardVisible}
        onClose={() => setImpactCardVisible(false)}
        user={user}
        impactHours={impactHours}
        t={t}
        locale={locale}
        isRTL={isRTL}
        textAlign={textAlign}
      />

      {/* 2. Motivation Selection Modal */}
      <MotivationPickerModal
        visible={motivationPickerVisible}
        onClose={() => setMotivationPickerVisible(false)}
        token={token}
        currentMotivations={user?.motivations || []}
        onSaved={(updated) => onUpdateUser({ ...user, motivations: updated })}
        t={t}
        locale={locale}
        textAlign={textAlign}
        isRTL={isRTL}
      />

      {/* 3. Squads Hub Modal */}
      <SquadModal
        visible={squadModalVisible}
        onClose={() => setSquadModalVisible(false)}
        token={token}
        t={t}
        locale={locale}
        textAlign={textAlign}
        isRTL={isRTL}
        onSquadUpdated={() => {
          // reload user info
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  heroCard: {
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: civicRadius.sm,
    backgroundColor: civic.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: civic.gold,
  },
  avatarText: {
    color: civic.gold,
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    color: civic.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    color: civic.muted,
    fontSize: 11,
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  editIconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#e6f4f2',
  },
  scoreRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef2f6',
    flexDirection: 'row',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e6f4f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scoreText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  statNumber: {
    color: civic.navy,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    color: civic.muted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    color: civic.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  editSkillsLink: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: '#e6f4f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.2)',
  },
  skillPillText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  emptySkillsText: {
    color: civic.muted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  passportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: civic.white,
    borderRadius: civicRadius.sm,
    borderWidth: 1,
    borderColor: civic.border,
    borderLeftWidth: 4,
    borderLeftColor: civic.navy,
    padding: 14,
    marginTop: 12,
    ...civicShadow.card,
  },
  passportBtnTitle: {
    color: civic.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  passportBtnSub: {
    color: civic.muted,
    fontSize: 11,
    marginTop: 1,
  },
  arrowText: {
    color: civic.teal,
    fontSize: 16,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: civic.dangerBg,
    borderRadius: civicRadius.sm,
    borderWidth: 1,
    borderColor: civic.dangerBorder,
    paddingVertical: 12,
    marginTop: 16,
  },
  logoutText: {
    color: civic.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: civic.overlay,
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: civic.white,
    borderRadius: civicRadius.sm,
    padding: 18,
    borderTopWidth: 3,
    borderTopColor: civic.navy,
    ...civicShadow.raised,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  modalTitle: {
    color: civic.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  inputLabel: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: civic.navy,
    backgroundColor: civic.bgSoft,
  },
  manageSkillsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: civic.teal,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
    backgroundColor: '#f0fdfa',
  },
  manageSkillsBtnText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  modalSaveBtn: {
    backgroundColor: civic.navy,
    borderRadius: civicRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
    borderBottomWidth: 3,
    borderBottomColor: civic.gold,
  },
  modalSaveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  tierPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  tierPillText: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: '800',
  },
  perksList: {
    gap: 6,
    marginTop: 4,
  },
  perkRow: {
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontSize: 12,
    color: civic.text,
    flex: 1,
  },
  appreciationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
  },
  appreciationChip: {
    flex: 1,
    backgroundColor: civic.canvas,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: civic.border,
  },
  appreciationVal: {
    fontSize: 14,
    fontWeight: '800',
    color: civic.teal,
  },
  appreciationLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: civic.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: civic.teal,
    paddingVertical: 13,
    borderRadius: civicRadius.lg,
    ...civicShadow.card,
  },
  actionBtnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: civic.borderHover,
    paddingVertical: 12,
    borderRadius: civicRadius.lg,
  },
  actionBtnSecondaryText: {
    color: civic.text,
    fontSize: 13,
    fontWeight: '700',
  },
  bringFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 122, 111, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(13, 122, 111, 0.25)',
    padding: 12,
    borderRadius: civicRadius.lg,
  },
  bringFriendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: civic.teal,
  },
  bringFriendSub: {
    fontSize: 10,
    color: civic.muted,
    marginTop: 1,
  },
});
