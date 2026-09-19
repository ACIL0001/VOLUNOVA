import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock, Compass, Flame, MapPin } from 'lucide-react-native';
import { civic } from '../theme/civic';
import { CivicBadge, CivicCard, CivicProgress, SecondaryButton } from './ui/Civic';

export function fillPercent(mission: any) {
  return mission?.totalSlotsNeeded > 0
    ? Math.round((mission.totalSlotsFilled / mission.totalSlotsNeeded) * 100)
    : 0;
}

export function localizeCategory(category: string, t: (path: string) => string) {
  const key = `categories.${category}`;
  const translated = t(key);
  return translated === key ? category : translated;
}

export function localizeUrgency(urgency: string, t: (path: string) => string) {
  const key = `urgency.${urgency}`;
  const translated = t(key);
  return translated === key ? urgency : translated;
}

interface MissionCardProps {
  mission: any;
  t: (path: string) => string;
  textAlign: 'left' | 'right';
  flexDirection: 'row' | 'row-reverse';
  onOpen: () => void;
}

export default function MissionCard({
  mission,
  t,
  textAlign,
  flexDirection,
  onOpen,
}: MissionCardProps) {
  const pct = fillPercent(mission);

  return (
    <CivicCard>
      <View style={[styles.topRow, { flexDirection }]}>
        <CivicBadge label={localizeCategory(mission.category, t)} tone="teal" />
        {mission.urgency ? (
          <View style={[styles.urgency, { flexDirection }]}>
            <Flame size={12} color={civic.amber} strokeWidth={2.2} />
            <Text style={styles.urgencyText}>{localizeUrgency(mission.urgency, t)}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { textAlign }]} numberOfLines={2}>
        {mission.title}
      </Text>
      {!!mission.description && (
        <Text style={[styles.desc, { textAlign }]} numberOfLines={3}>
          {mission.description}
        </Text>
      )}

      <View style={[styles.metaRow, { flexDirection }]}>
        <View style={[styles.metaChip, { flexDirection }]}>
          <MapPin size={13} color={civic.teal} />
          <Text style={styles.metaText} numberOfLines={1}>
            {mission.venueName}
          </Text>
        </View>
        <View style={[styles.metaChip, { flexDirection }]}>
          <Clock size={13} color={civic.navy} />
          <Text style={styles.metaText}>
            {mission.estimatedHoursPerVolunteer || 4} {t('browse.hours_suffix')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.progressLabels, { flexDirection }]}>
          <Text style={styles.progressLabel}>{t('browse.slots_completion')}</Text>
          <Text style={styles.progressValue}>
            {mission.totalSlotsFilled} / {mission.totalSlotsNeeded} ({pct}%)
          </Text>
        </View>
        <CivicProgress pct={pct} />
        <View style={{ height: 12 }} />
        <SecondaryButton
          label={t('missions.open_ops_room')}
          onPress={onOpen}
          icon={<Compass size={15} color={civic.navy} />}
        />
      </View>
    </CivicCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  urgency: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    color: civic.amber,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: civic.navy,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  desc: {
    color: civic.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  metaRow: {
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  metaChip: {
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
  metaText: {
    color: civic.muted,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 180,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: civic.border,
    paddingTop: 12,
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
  progressValue: {
    color: civic.navy,
    fontSize: 11,
    fontWeight: '700',
  },
});
