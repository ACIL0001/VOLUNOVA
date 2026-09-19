import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Sparkles,
  Users,
  X,
} from 'lucide-react-native';
import { civic, civicRadius } from '../theme/civic';
import { CivicBadge, CivicCard, CivicProgress, PrimaryButton } from './ui/Civic';
import { fillPercent, localizeCategory, localizeUrgency } from './MissionCard';

interface MissionOpsSheetProps {
  visible: boolean;
  mission: any | null;
  joiningNeedId: string | null;
  joinedNeedIds: string[];
  onClose: () => void;
  onJoin: (missionId: string, needId: string, hours: number) => void;
  t: (path: string) => string;
  isRTL: boolean;
  textAlign: 'left' | 'right';
  flexDirection: 'row' | 'row-reverse';
}

export default function MissionOpsSheet({
  visible,
  mission,
  joiningNeedId,
  joinedNeedIds,
  onClose,
  onJoin,
  t,
  isRTL,
  textAlign,
  flexDirection,
}: MissionOpsSheetProps) {
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  if (!mission) return null;

  const pct = fillPercent(mission);
  const hours = mission.estimatedHoursPerVolunteer || 4;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={[styles.top, { flexDirection }]}>
            <TouchableOpacity onPress={onClose} style={[styles.backBtn, { flexDirection }]}>
              <BackArrow size={16} color={civic.muted} />
              <Text style={styles.backText}>{t('ops.back')}</Text>
            </TouchableOpacity>
            <View style={[styles.live, { flexDirection }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{t('ops.live_badge')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.close}>
              <X size={16} color={civic.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
            <CivicCard style={{ marginBottom: 14 }}>
              <View style={[styles.metaRow, { flexDirection }]}>
                <CivicBadge label={localizeCategory(mission.category, t)} />
                <View style={[styles.chip, { flexDirection }]}>
                  <MapPin size={13} color={civic.teal} />
                  <Text style={styles.chipText}>{mission.venueName}</Text>
                </View>
                <View style={[styles.chip, { flexDirection }]}>
                  <Clock size={13} color={civic.muted} />
                  <Text style={styles.chipText}>
                    {hours} {t('browse.hours_suffix')}
                  </Text>
                </View>
                {mission.urgency ? (
                  <View style={[styles.chip, styles.amberChip, { flexDirection }]}>
                    <Flame size={13} color={civic.amber} />
                    <Text style={[styles.chipText, { color: civic.amber }]}>
                      {localizeUrgency(mission.urgency, t)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.title, { textAlign }]}>{mission.title}</Text>
              {!!mission.description && (
                <Text style={[styles.desc, { textAlign }]}>{mission.description}</Text>
              )}
              <View style={styles.rateBox}>
                <Text style={styles.rateLabel}>{t('ops.completion_rate')}</Text>
                <Text style={styles.rateValue}>{pct}%</Text>
                <Text style={styles.rateSub}>
                  {mission.totalSlotsFilled} {t('ops.slots_of')} {mission.totalSlotsNeeded}{' '}
                  {t('ops.slots_filled_desc')}
                </Text>
                <View style={{ height: 8 }} />
                <CivicProgress pct={pct} />
              </View>
            </CivicCard>

            <View style={[styles.sectionHead, { flexDirection }]}>
              <View style={[styles.sectionHead, { flexDirection, gap: 8 }]}>
                <Users size={18} color={civic.teal} />
                <Text style={styles.sectionTitle}>{t('ops.roles_title')}</Text>
              </View>
              <Text style={styles.sectionCount}>
                {mission.needs?.length || 0} {t('ops.extracted_roles_count')}
              </Text>
            </View>

            {(mission.needs || []).map((need: any) => {
              const filled = need.quantityFulfilled >= need.quantityNeeded;
              const needPct =
                need.quantityNeeded > 0
                  ? Math.round((need.quantityFulfilled / need.quantityNeeded) * 100)
                  : 0;
              const joined = joinedNeedIds.includes(need._id);

              return (
                <CivicCard key={need._id} style={{ marginBottom: 10 }}>
                  <View style={[styles.needHead, { flexDirection }]}>
                    <Text style={[styles.needTitle, { textAlign, flex: 1 }]}>{need.roleName}</Text>
                    <CivicBadge
                      label={filled ? t('ops.status_completed') : t('ops.status_open')}
                      tone={filled ? 'success' : 'muted'}
                    />
                  </View>
                  <Text style={[styles.needSkill, { textAlign }]}>
                    {t('ops.skill_required')}: {need.skillTag}
                  </Text>
                  <View style={[styles.progressLabels, { flexDirection }]}>
                    <Text style={styles.progressLabel}>{t('ops.available_slots')}</Text>
                    <Text style={styles.progressValue}>
                      {need.quantityFulfilled} / {need.quantityNeeded} ({needPct}%)
                    </Text>
                  </View>
                  <CivicProgress pct={needPct} />
                  <View style={{ height: 12 }} />
                  {joined ? (
                    <View style={[styles.joined, { flexDirection }]}>
                      <CheckCircle2 size={16} color={civic.teal} />
                      <Text style={styles.joinedText}>{t('ops.you_joined')}</Text>
                    </View>
                  ) : (
                    <PrimaryButton
                      label={t('ops.accept_role_btn')}
                      onPress={() => onJoin(mission._id, need._id, hours)}
                      loading={joiningNeedId === need._id}
                      disabled={filled}
                      icon={<Sparkles size={15} color="#fff" />}
                    />
                  )}
                </CivicCard>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: civic.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: civic.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  top: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  backBtn: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: civicRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backText: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  live: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: civicRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '800',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.backgroundAlt,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amberChip: {
    backgroundColor: civic.amberBg,
  },
  chipText: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: civic.navy,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  desc: {
    color: civic.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  rateBox: {
    borderTopWidth: 1,
    borderTopColor: civic.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  rateLabel: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rateValue: {
    color: civic.teal,
    fontSize: 32,
    fontWeight: '900',
  },
  rateSub: {
    color: civic.muted,
    fontSize: 12,
  },
  sectionHead: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: civic.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionCount: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: civic.white,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  needHead: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  needTitle: {
    color: civic.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  needSkill: {
    color: civic.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  progressLabels: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: civic.muted,
    fontSize: 11,
  },
  progressValue: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  joined: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: civic.tealSoft,
    borderWidth: 1,
    borderColor: civic.successBorder,
    borderRadius: civicRadius.md,
    paddingVertical: 10,
  },
  joinedText: {
    color: civic.teal,
    fontSize: 13,
    fontWeight: '800',
  },
});
