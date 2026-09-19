import React from 'react';
import {
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import {
  Award,
  Clock,
  Heart,
  TreePine,
  Users,
  Share2,
  X,
  Sparkles,
  MapPin,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react-native';
import { civic, civicRadius, civicShadow } from '../theme/civic';
import { CivicCard } from './ui/Civic';

interface MyImpactCardModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  impactHours: number;
  t: (key: string, params?: any) => string;
  locale: string;
  isRTL: boolean;
  textAlign: 'left' | 'right';
}

export default function MyImpactCardModal({
  visible,
  onClose,
  user,
  impactHours,
  t,
  locale,
  isRTL,
  textAlign,
}: MyImpactCardModalProps) {
  if (!visible) return null;

  const certId = `VOL-DZ-${(user?._id || user?.id || 'USER').toString().slice(-6).toUpperCase()}`;
  const hours = user?.impactHours !== undefined ? user.impactHours : impactHours;
  const missions = Math.max(1, Math.round(hours / 3));
  const trees = Math.max(hours > 0 ? 3 : 0, Math.round(hours * 0.8));
  const families = Math.max(hours > 0 ? 2 : 0, Math.round(hours * 0.5));

  const tierTitles: Record<string, string> = {
    level_1_new: locale === 'ar' ? 'متطوع جديد 🌱' : 'Nouveau Bénévole 🌱',
    level_2_active: locale === 'ar' ? 'متطوع نشيط ⚡' : 'Bénévole Actif ⚡',
    level_3_trusted: locale === 'ar' ? 'متطوع موثوق 🛡️' : 'Bénévole de Confiance 🛡️',
    level_4_leader: locale === 'ar' ? 'قائد ميداني 👑' : 'Leader de Terrain 👑',
    level_5_impact_maker: locale === 'ar' ? 'صانع أثر 🌟' : 'Bâtisseur d’Impact 🌟',
  };

  const statusTitle = tierTitles[user?.statusTier || 'level_1_new'] || tierTitles['level_1_new'];

  const totalAppreciations =
    (user?.appreciationsReceived?.thankYou || 0) +
    (user?.appreciationsReceived?.teamSpirit || 0) +
    (user?.appreciationsReceived?.vitalRole || 0) +
    (user?.appreciationsReceived?.rapidResponder || 0);

  const shareText =
    locale === 'ar'
      ? `🇩🇿 بطاقة أثري في فولونوفا (VOLUNOVA)!\n👤 المتطوع: ${user?.name || 'متطوع'}\n📍 الحومة: ${user?.neighborhood || user?.city || 'باب الزوار'}\n⏱️ ${hours} ساعة في الميدان\n🏆 ${missions} مهمة تطوعية\n🌳 ${trees} شجرة مغروسة\n❤️ ${families} عائلة مدعومة\n"كل ساعة تحدث فرقاً حقيقياً."\nتحقق من الجواز: https://volunova.dz/passport/${certId}`
      : `🇩🇿 Mon Impact VOLUNOVA !\n👤 ${user?.name || 'Bénévole'} | 📍 ${user?.neighborhood || user?.city || 'Bab Ezzouar'}\n⏱️ ${hours}h sur le terrain | 🏆 ${missions} missions\n🌳 ${trees} arbres | ❤️ ${families} familles aidées\n"Chaque heure compte."\nhttps://volunova.dz/passport/${certId}`;

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareText,
        title: locale === 'ar' ? 'أثري في فولونوفا' : 'Mon Impact VOLUNOVA',
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    Linking.openURL(url).catch(() => {
      handleNativeShare();
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {locale === 'ar' ? '📸 بطاقة الأثر الرقمية' : '📸 Carte d’Impact Civique'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={civic.muted} />
            </TouchableOpacity>
          </View>

          {/* Impact Card Canvas Preview */}
          <View style={styles.cardCanvas}>
            {/* Header Badge */}
            <View style={styles.canvasHeader}>
              <View style={styles.flagBadge}>
                <Text style={{ fontSize: 13 }}>🇩🇿</Text>
                <Text style={styles.flagText}>VOLUNOVA CITIZEN</Text>
              </View>
              <Text style={styles.certCode}>{certId}</Text>
            </View>

            {/* Volunteer Avatar & Name */}
            <View style={styles.userSection}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
                </Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={[styles.cardUserName, { textAlign }]} numberOfLines={1}>
                  {user?.name || 'متطوع فولونوفا'}
                </Text>
                <View style={styles.cardLocRow}>
                  <MapPin size={11} color={civic.teal} />
                  <Text style={styles.cardLocText}>
                    {user?.neighborhood || user?.city || 'Bab Ezzouar'}
                  </Text>
                </View>
              </View>
              <View style={styles.tierPill}>
                <Text style={styles.tierPillText}>{statusTitle}</Text>
              </View>
            </View>

            {/* Telemetry Metrics 2x2 Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Clock size={16} color={civic.teal} />
                <Text style={styles.metricVal}>{hours}h</Text>
                <Text style={styles.metricLbl}>
                  {locale === 'ar' ? 'ساعات تطوع' : 'Heures'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Award size={16} color={civic.teal} />
                <Text style={styles.metricVal}>{missions}</Text>
                <Text style={styles.metricLbl}>
                  {locale === 'ar' ? 'مهام منجزة' : 'Missions'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <TreePine size={16} color="#10b981" />
                <Text style={[styles.metricVal, { color: '#10b981' }]}>{trees}</Text>
                <Text style={styles.metricLbl}>
                  {locale === 'ar' ? 'شجرة مغروسة' : 'Arbres'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Heart size={16} color="#f43f5e" />
                <Text style={[styles.metricVal, { color: '#f43f5e' }]}>{families}</Text>
                <Text style={styles.metricLbl}>
                  {locale === 'ar' ? 'عائلة مدعومة' : 'Familles'}
                </Text>
              </View>
            </View>

            {/* Human Appreciations Footer */}
            {totalAppreciations > 0 && (
              <View style={styles.appreciationsStrip}>
                <Heart size={13} color="#f43f5e" />
                <Text style={styles.stripText}>
                  {locale === 'ar'
                    ? `تلقى ${totalAppreciations} تقديرات إنسانية من رفقاء الميدان والجمعيات ❤️`
                    : `${totalAppreciations} remerciements de la communauté ❤️`}
                </Text>
              </View>
            )}

            {/* Verification Footer */}
            <View style={styles.canvasFooter}>
              <ShieldCheck size={12} color={civic.teal} />
              <Text style={styles.footerText}>
                {locale === 'ar'
                  ? 'سجل مدني موثق — كل ساعة عطاء تصنع فرقاً حقيقياً'
                  : 'Certifié VOLUNOVA — Chaque heure compte'}
              </Text>
            </View>
          </View>

          {/* Social Share CTAs */}
          <View style={styles.actionsWrap}>
            <TouchableOpacity onPress={handleWhatsAppShare} style={styles.whatsAppBtn}>
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.whatsAppText}>
                {t('recognition.shareImpactWhatsApp')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNativeShare} style={styles.storyBtn}>
              <Share2 size={16} color={civic.teal} />
              <Text style={styles.storyText}>
                {t('recognition.shareImpactStory')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 34, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: civicRadius.xl,
    padding: 20,
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
    fontWeight: '700',
    color: civic.text,
  },
  closeBtn: {
    padding: 6,
    borderRadius: civicRadius.md,
    backgroundColor: civic.canvas,
  },
  cardCanvas: {
    backgroundColor: '#071322',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#0d7a6f',
    marginBottom: 16,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 122, 111, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  flagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2dd4bf',
    letterSpacing: 0.5,
  },
  certCode: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0d7a6f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  cardUserName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cardLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardLocText: {
    color: '#94a3b8',
    fontSize: 11,
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
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricVal: {
    color: '#2dd4bf',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  metricLbl: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  appreciationsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  stripText: {
    color: '#fda4af',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  canvasFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
  },
  actionsWrap: {
    gap: 8,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: civicRadius.lg,
  },
  whatsAppText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  storyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: civic.canvas,
    borderWidth: 1,
    borderColor: civic.borderHover,
    paddingVertical: 11,
    borderRadius: civicRadius.lg,
  },
  storyText: {
    color: civic.teal,
    fontSize: 13,
    fontWeight: '700',
  },
});
