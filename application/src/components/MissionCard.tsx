import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Clock, Flame, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { civic, civicShadow } from '../theme/civic';
import { useTranslation } from '../context/LanguageContext';
import ProgressBar from './ProgressBar';

export type MissionCardData = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  venueName?: string;
  urgency?: string;
  estimatedHoursPerVolunteer?: number;
  totalSlotsNeeded?: number;
  totalSlotsFilled?: number;
  orgId?: { name?: string };
};

const URGENCY_KEY: Record<string, string> = {
  urgent: 'urgency.urgent',
  high: 'urgency.high',
  medium: 'urgency.medium',
  low: 'urgency.low',
};

export default function MissionCard({
  mission,
  onOpen,
}: {
  mission: MissionCardData;
  onOpen: () => void;
}) {
  const { t, isRTL, textAlign, flexDirection } = useTranslation();
  const needed = mission.totalSlotsNeeded || 0;
  const filled = mission.totalSlotsFilled || 0;
  const pct = needed > 0 ? Math.round((filled / needed) * 100) : 0;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const urgencyKey = URGENCY_KEY[mission.urgency || 'medium'] || 'urgency.medium';
  const categoryKey = mission.category && t(`categories.${mission.category}`) !== `categories.${mission.category}`
    ? t(`categories.${mission.category}`)
    : mission.category || t('categories.All');

  return (
    <View style={styles.card}>
      <View style={[styles.top, { flexDirection }]}>
        <View style={styles.cat}>
          <Text style={styles.catText} numberOfLines={1}>{categoryKey}</Text>
        </View>
        <View style={styles.urgency}>
          <Flame size={11} color={civic.amberText} />
          <Text style={styles.urgencyText}>{t(urgencyKey)}</Text>
        </View>
      </View>

      <Text style={[styles.title, { textAlign }]} numberOfLines={2}>
        {mission.title}
      </Text>
      {mission.orgId?.name ? (
        <Text style={[styles.org, { textAlign }]} numberOfLines={1}>
          {mission.orgId.name}
        </Text>
      ) : null}
      {mission.description ? (
        <Text style={[styles.desc, { textAlign }]} numberOfLines={3}>
          {mission.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        {mission.venueName ? (
          <View style={styles.chip}>
            <MapPin size={12} color={civic.teal} />
            <Text style={styles.chipText} numberOfLines={1}>{mission.venueName}</Text>
          </View>
        ) : null}
        <View style={styles.chip}>
          <Clock size={12} color={civic.navy} />
          <Text style={styles.chipText}>
            {mission.estimatedHoursPerVolunteer || 4} {t('browse.hours_suffix')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.progressLabels, { flexDirection }]}>
          <Text style={styles.progressMuted}>{t('browse.slots_completion')}</Text>
          <Text style={styles.progressStrong}>
            {filled} / {needed} ({pct}%)
          </Text>
        </View>
        <ProgressBar percent={pct} />
        <TouchableOpacity style={styles.cta} onPress={onOpen} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('missions.open_ops_room')}</Text>
          <ArrowIcon size={14} color={civic.navy} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: civic.surface,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 16,
    padding: 16,
    ...civicShadow.card,
  },
  top: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  cat: {
    backgroundColor: civic.tealSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '62%',
  },
  catText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  urgency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    color: civic.amberText,
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: civic.navy,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 4,
  },
  org: {
    color: civic.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  desc: {
    color: civic.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: civic.border,
    backgroundColor: civic.white,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    maxWidth: '100%',
  },
  chipText: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 180,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: civic.border,
    paddingTop: 12,
    gap: 8,
  },
  progressLabels: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressMuted: {
    color: civic.muted,
    fontSize: 11,
  },
  progressStrong: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  cta: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: civic.border,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ctaText: {
    color: civic.navy,
    fontSize: 13,
    fontWeight: '700',
  },
});
