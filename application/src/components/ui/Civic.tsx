import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { civic, civicRadius, civicShadow } from '../../theme/civic';

export interface CivicCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
}

export const CivicCard: React.FC<CivicCardProps> = ({
  children,
  style,
  onPress,
  activeOpacity = 0.85,
}) => {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[styles.card, civicShadow.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, civicShadow.card, style]}>{children}</View>;
};

export type CivicBadgeTone = 'teal' | 'success' | 'amber' | 'danger' | 'purple' | 'muted' | 'gold';

export interface CivicBadgeProps {
  label: string;
  tone?: CivicBadgeTone;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CivicBadge: React.FC<CivicBadgeProps> = ({
  label,
  tone = 'teal',
  icon,
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (tone) {
      case 'success':
        return { bg: civic.successBg, text: civic.success, border: civic.successBorder };
      case 'amber':
      case 'gold':
        return { bg: civic.amberBg, text: civic.amberText, border: civic.amberBorder };
      case 'danger':
        return { bg: civic.dangerBg, text: civic.danger, border: civic.dangerBorder };
      case 'purple':
        return { bg: civic.purpleBg, text: civic.purple, border: civic.purpleBorder };
      case 'muted':
        return { bg: civic.bgSoft, text: civic.muted, border: civic.border };
      case 'teal':
      default:
        return { bg: civic.tealSoft, text: civic.teal, border: civic.tealMuted };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      {icon ? <View style={styles.badgeIcon}>{icon}</View> : null}
      <Text style={[styles.badgeText, { color: colors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

export interface CivicProgressProps {
  pct: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const CivicProgress: React.FC<CivicProgressProps> = ({
  pct,
  color = civic.teal,
  trackColor = civic.track,
  height = 7,
  style,
}) => {
  const clamped = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
  return (
    <View
      style={[
        styles.progressTrack,
        { backgroundColor: trackColor, height, borderRadius: height / 2 },
        style,
      ]}
    >
      <View
        style={[
          styles.progressBar,
          {
            width: `${clamped}%`,
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  let bg = civic.teal;
  let textColor = '#ffffff';
  let borderColor = 'transparent';

  if (isOutline) {
    bg = 'transparent';
    textColor = civic.teal;
    borderColor = civic.teal;
  } else if (isSecondary) {
    bg = civic.tealSoft;
    textColor = civic.teal;
    borderColor = civic.tealMuted;
  } else if (isDanger) {
    bg = civic.danger;
    textColor = '#ffffff';
  }

  if (disabled) {
    bg = civic.track;
    textColor = civic.muted2;
    borderColor = civic.border;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isOutline ? 1.5 : isSecondary ? 1 : 0,
          opacity: disabled ? 0.7 : 1,
        },
        civicShadow.card,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.buttonContent}>
          {icon ? <View style={{ marginEnd: 8 }}>{icon}</View> : null}
          <Text style={[styles.buttonText, { color: textColor }, textStyle]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: civic.surface,
    borderRadius: civicRadius.md,
    borderWidth: 1,
    borderColor: civic.border,
    padding: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: civicRadius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginEnd: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 4,
  },
  button: {
    height: 46,
    borderRadius: civicRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
