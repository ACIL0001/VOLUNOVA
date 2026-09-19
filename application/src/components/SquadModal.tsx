import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Users,
  X,
  Plus,
  TreePine,
  Heart,
  Clock,
  Award,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react-native';
import { civic, civicRadius, civicShadow } from '../theme/civic';
import { CivicCard, PrimaryButton } from './ui/Civic';
import { getBackendUrl } from '../config/apiConfig';

interface SquadModalProps {
  visible: boolean;
  onClose: () => void;
  token: string | null;
  t: (key: string, params?: any) => string;
  locale: string;
  textAlign: 'left' | 'right';
  isRTL: boolean;
  onSquadUpdated: () => void;
}

export default function SquadModal({
  visible,
  onClose,
  token,
  t,
  locale,
  textAlign,
  isRTL,
  onSquadUpdated,
}: SquadModalProps) {
  const backendUrl = getBackendUrl();

  const [squad, setSquad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'view' | 'create' | 'join'>('view');

  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (visible && token) {
      loadSquad();
    }
  }, [visible, token]);

  const loadSquad = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/squads/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setSquad(json.data);
        setMode('view');
      } else {
        setSquad(null);
      }
    } catch (e) {
      console.warn('Could not load squad:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSquad = async () => {
    if (!createName.trim()) {
      Alert.alert('Attention', 'Veuillez saisir un nom pour votre Squad.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/squads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: createName.trim() }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setSquad(json.data);
        setMode('view');
        onSquadUpdated();
        Alert.alert('Félicitations !', 'Votre Squad a été créée avec succès.');
      } else {
        Alert.alert('Erreur', json.error?.message || 'Impossible de créer la Squad.');
      }
    } catch {
      Alert.alert('Erreur', 'Connexion réseau impossible.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinSquad = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Attention', 'Veuillez saisir le code d’invitation.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/squads/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode: joinCode.trim() }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setSquad(json.data);
        setMode('view');
        onSquadUpdated();
        Alert.alert('Bienvenue !', 'Vous avez rejoint la Squad avec succès.');
      } else {
        Alert.alert('Erreur', json.error?.message || 'Code de Squad invalide.');
      }
    } catch {
      Alert.alert('Erreur', 'Connexion réseau impossible.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShareInvite = async () => {
    if (!squad) return;
    const text =
      locale === 'ar'
        ? `🔥 انضم إلى فريقي الميداني "${squad.name}" في فولونوفا (VOLUNOVA)!\nرمز الدعوة: ${squad.inviteCode}\nحمل التطبيق وانضم للمهمة القادمة معنا: https://volunova.dz`
        : `🔥 Rejoins ma Squad "${squad.name}" sur VOLUNOVA !\nCode d’invitation : ${squad.inviteCode}\nRejoins-nous sur le terrain : https://volunova.dz`;

    try {
      await Share.share({ message: text });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Users size={20} color={civic.teal} />
              <Text style={styles.headerTitle}>{t('squads.title')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={civic.muted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={civic.teal} />
            </View>
          ) : squad && mode === 'view' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Squad Hero */}
              <View style={styles.squadHero}>
                <View style={styles.squadIconBox}>
                  <Text style={{ fontSize: 28 }}>🟢</Text>
                </View>
                <Text style={styles.squadName}>{squad.name}</Text>
                <Text style={styles.squadMeta}>
                  {squad.members?.length || 1} {t('squads.membersCount')} • {squad.neighborhood || 'Bab Ezzouar'}
                </Text>

                {/* Invite Code Pill */}
                <TouchableOpacity onPress={handleShareInvite} style={styles.invitePill}>
                  <Text style={styles.inviteLabel}>
                    {locale === 'ar' ? 'رمز دعوة الأصدقاء:' : 'Code d’invitation :'}
                  </Text>
                  <Text style={styles.inviteCode}>{squad.inviteCode}</Text>
                  <Share2 size={13} color={civic.teal} />
                </TouchableOpacity>
              </View>

              {/* Collective Impact */}
              <View style={styles.impactCard}>
                <Text style={[styles.sectionTitle, { textAlign }]}>
                  {t('squads.collectiveImpact')}
                </Text>

                <View style={styles.impactGrid}>
                  <View style={styles.impactItem}>
                    <Award size={16} color={civic.teal} />
                    <Text style={styles.impactVal}>{squad.missionsCompletedCount || 0}</Text>
                    <Text style={styles.impactLbl}>{t('squads.squadMissions')}</Text>
                  </View>

                  <View style={styles.impactItem}>
                    <Clock size={16} color={civic.teal} />
                    <Text style={styles.impactVal}>{squad.totalImpactHours || 0}h</Text>
                    <Text style={styles.impactLbl}>{t('squads.squadHours')}</Text>
                  </View>

                  <View style={styles.impactItem}>
                    <TreePine size={16} color="#10b981" />
                    <Text style={[styles.impactVal, { color: '#10b981' }]}>{squad.treesPlanted || 0}</Text>
                    <Text style={styles.impactLbl}>{t('squads.squadTrees')}</Text>
                  </View>

                  <View style={styles.impactItem}>
                    <Heart size={16} color="#f43f5e" />
                    <Text style={[styles.impactVal, { color: '#f43f5e' }]}>{squad.familiesHelped || 0}</Text>
                    <Text style={styles.impactLbl}>{t('squads.squadFamilies')}</Text>
                  </View>
                </View>
              </View>

              {/* Squad Members */}
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.sectionTitle, { textAlign }]}>
                  {locale === 'ar' ? 'أعضاء الفريق' : 'Membres du Squad'}
                </Text>
                <View style={{ gap: 8, marginTop: 8 }}>
                  {squad.members?.map((m: any) => (
                    <View key={m._id || m.id} style={styles.memberRow}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {m.name ? m.name.charAt(0).toUpperCase() : 'V'}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={[styles.memberName, { textAlign }]}>{m.name}</Text>
                        <Text style={[styles.memberSub, { textAlign }]}>
                          {m.impactHours || 0}h • {m.statusTier ? m.statusTier.replace(/level_\d_/, '') : 'vol'}
                        </Text>
                      </View>
                      {m._id === squad.leaderId?._id && (
                        <View style={styles.leaderBadge}>
                          <Text style={styles.leaderText}>
                            {locale === 'ar' ? 'المؤسس' : 'Leader'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : mode === 'create' ? (
            <View>
              <Text style={[styles.sectionTitle, { textAlign, marginBottom: 8 }]}>
                {locale === 'ar' ? 'إنشاء مجموعة تطوعية جديدة' : 'Créer votre Squad'}
              </Text>
              <Text style={[styles.descText, { textAlign, marginBottom: 14 }]}>
                {locale === 'ar'
                  ? 'اختر اسماً لفريقك وادعُ أصدقاءك لتتطوعوا معاً وتجمعوا ساعات الأثر بشكل جماعي.'
                  : 'Donnez un nom à votre équipe et invitez vos proches à agir ensemble.'}
              </Text>

              <TextInput
                value={createName}
                onChangeText={setCreateName}
                placeholder={t('squads.squadNamePlaceholder')}
                placeholderTextColor={civic.mutedSoft}
                style={[styles.input, { textAlign }]}
              />

              <View style={{ marginTop: 16, gap: 8 }}>
                <PrimaryButton
                  label={locale === 'ar' ? 'تأكيد إنشاء المجموعة' : 'Créer la Squad'}
                  onPress={handleCreateSquad}
                  loading={actionLoading}
                  icon={<Sparkles size={15} color="#fff" />}
                />
                <TouchableOpacity onPress={() => setMode('view')} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>{locale === 'ar' ? 'إلغاء' : 'Annuler'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : mode === 'join' ? (
            <View>
              <Text style={[styles.sectionTitle, { textAlign, marginBottom: 8 }]}>
                {locale === 'ar' ? 'الانضمام إلى مجموعة أصدقائك' : 'Rejoindre une Squad existante'}
              </Text>
              <Text style={[styles.descText, { textAlign, marginBottom: 14 }]}>
                {locale === 'ar'
                  ? 'أدخل رمز الدعوة المكون من 6 أحرف الذي شاركه معك صديقك.'
                  : 'Saisissez le code d’invitation à 6 caractères partagé par votre ami.'}
              </Text>

              <TextInput
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="Ex: GRN782"
                placeholderTextColor={civic.mutedSoft}
                autoCapitalize="characters"
                style={[styles.input, { textAlign: 'center', letterSpacing: 3, fontWeight: '800' }]}
              />

              <View style={{ marginTop: 16, gap: 8 }}>
                <PrimaryButton
                  label={locale === 'ar' ? 'الانضمام للمجموعة' : 'Rejoindre la Squad'}
                  onPress={handleJoinSquad}
                  loading={actionLoading}
                  icon={<Users size={15} color="#fff" />}
                />
                <TouchableOpacity onPress={() => setMode('view')} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>{locale === 'ar' ? 'إلغاء' : 'Annuler'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* No Squad State */
            <View style={{ paddingVertical: 10 }}>
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <Users size={36} color={civic.borderHover} />
                <Text style={[styles.noSquadTitle, { marginTop: 8 }]}>{t('squads.noSquad')}</Text>
                <Text style={styles.noSquadSub}>
                  {locale === 'ar'
                    ? 'التطوع مع الأصدقاء أكثر متعة وتأثيراً. كوّن فريقك أو انضم لفريق موجود.'
                    : 'Agir à plusieurs décuple votre impact. Créez votre équipe ou rejoignez vos amis.'}
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                <PrimaryButton
                  label={t('squads.createSquadBtn')}
                  onPress={() => setMode('create')}
                  icon={<Plus size={15} color="#fff" />}
                />
                <TouchableOpacity onPress={() => setMode('join')} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{t('squads.joinSquadBtn')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 34, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: civicRadius.xl,
    padding: 20,
    maxHeight: '85%',
    ...civicShadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: civic.text,
  },
  closeBtn: {
    padding: 6,
    borderRadius: civicRadius.md,
    backgroundColor: civic.canvas,
  },
  squadHero: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: civic.border,
    marginBottom: 14,
  },
  squadIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: civic.tealSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  squadName: {
    fontSize: 18,
    fontWeight: '800',
    color: civic.text,
  },
  squadMeta: {
    fontSize: 12,
    color: civic.muted,
    marginTop: 2,
  },
  invitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: civic.canvas,
    borderWidth: 1,
    borderColor: civic.borderHover,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  inviteLabel: {
    fontSize: 11,
    color: civic.muted,
    fontWeight: '600',
  },
  inviteCode: {
    fontSize: 13,
    fontWeight: '800',
    color: civic.teal,
    fontFamily: 'monospace',
  },
  impactCard: {
    backgroundColor: civic.canvas,
    borderRadius: civicRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: civic.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: civic.text,
    marginBottom: 6,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 6,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: civic.border,
  },
  impactVal: {
    fontSize: 13,
    fontWeight: '800',
    color: civic.teal,
    marginTop: 2,
  },
  impactLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: civic.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: civic.canvas,
    borderWidth: 1,
    borderColor: civic.border,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: civic.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: civic.text,
  },
  memberSub: {
    fontSize: 11,
    color: civic.muted,
  },
  leaderBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  noSquadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: civic.text,
  },
  noSquadSub: {
    fontSize: 12,
    color: civic.muted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: civicRadius.lg,
    borderWidth: 1,
    borderColor: civic.borderHover,
    backgroundColor: civic.canvas,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: civic.text,
  },
  input: {
    borderWidth: 1,
    borderColor: civic.borderHover,
    borderRadius: civicRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: civic.text,
    backgroundColor: civic.canvas,
  },
  descText: {
    fontSize: 12,
    color: civic.muted,
    lineHeight: 18,
  },
  cancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 12,
    color: civic.muted,
    fontWeight: '600',
  },
});
