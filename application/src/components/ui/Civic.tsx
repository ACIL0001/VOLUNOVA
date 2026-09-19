import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { civic, civicRadius, civicShadow } from '../../theme/civic';

export function CivicCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CivicProgress({ pct }: { pct: number }) {
  const width = `${Math.min(100, Math.max(0, pct))}%` as `${number}%`;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

export function CivicBadge({
  label,
  tone = 'teal',
}: {
  label: string;
  tone?: 'teal' | 'amber' | 'muted' | 'navy' | 'success';
}) {
  return (
    <View style={[styles.badge, badgeTone[tone]]}>
      <Text style={[styles.badgeText, badgeTextTone[tone]]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primaryBtn, (disabled || loading) && styles.btnDisabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.btnInner}>
          {icon}
          <Text style={styles.primaryBtnText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.secondaryBtn}>
      <View style={styles.btnInner}>
        {icon}
        <Text style={styles.secondaryBtnText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const badgeTone = {
  teal: { backgroundColor: civic.tealSoft, borderColor: 'rgba(13,122,111,0.2)' },
  amber: { backgroundColor: civic.amberBg, borderColor: '#f1e3c8' },
  muted: { backgroundColor: civic.track, borderColor: civic.border },
  navy: { backgroundColor: civic.navy, borderColor: civic.navy },
  success: { backgroundColor: civic.successBg, borderColor: civic.successBorder },
};

const badgeTextTone = {
  teal: { color: civic.teal },
  amber: { color: civic.amber },
  muted: { color: civic.muted },
  navy: { color: civic.white },
  success: { color: civic.teal },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: civic.surface,
    borderRadius: civicRadius.lg,
    borderWidth: 1,
    borderColor: civic.border,
    padding: 16,
    ...civicShadow.card,
  },
  track: {
    height: 6,
    width: '100%',
    borderRadius: civicRadius.pill,
    backgroundColor: civic.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: civic.teal,
    borderRadius: civicRadius.pill,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '70%',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: civic.teal,
    borderRadius: civicRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnText: {
    color: civic.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: civic.surface,
    borderRadius: civicRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: civic.border,
    minHeight: 46,
  },
  secondaryBtnText: {
    color: civic.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
