import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Heart, Sparkles, X, TreePine, Users, CheckCircle2 } from 'lucide-react-native';
import { civic, civicRadius, civicShadow } from '../theme/civic';
import { PrimaryButton } from './ui/Civic';

interface OutcomeStoryModalProps {
  visible: boolean;
  onClose: () => void;
  story: {
    headline: string;
    summary?: string;
    treesPlanted?: number;
    familiesAssisted?: number;
    missionTitle?: string;
  } | null;
  t: (key: string, params?: any) => string;
  locale: string;
  textAlign: 'left' | 'right';
  isRTL: boolean;
}

export default function OutcomeStoryModal({
  visible,
  onClose,
  story,
  t,
  locale,
  textAlign,
  isRTL,
}: OutcomeStoryModalProps) {
  if (!visible || !story) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Heart Animation Badge */}
          <View style={styles.badgeWrap}>
            <View style={styles.heartCircle}>
              <Heart size={32} color="#f43f5e" fill="#f43f5e" />
            </View>
          </View>

          <Text style={styles.storyTitle}>{t('outcome.storyTitle')}</Text>
          <Text style={styles.storySub}>{t('outcome.storySub')}</Text>

          {/* Tangible Headline Box */}
          <View style={styles.headlineCard}>
            <Text style={[styles.headlineText, { textAlign }]}>{story.headline}</Text>
            {story.summary ? (
              <Text style={[styles.summaryText, { textAlign, marginTop: 8 }]}>
                {story.summary}
              </Text>
            ) : null}
          </View>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            {story.treesPlanted ? (
              <View style={styles.metricPill}>
                <TreePine size={14} color="#10b981" />
                <Text style={styles.metricPillText}>{story.treesPlanted} شجرة</Text>
              </View>
            ) : null}
            {story.familiesAssisted ? (
              <View style={styles.metricPill}>
                <Heart size={14} color="#f43f5e" />
                <Text style={styles.metricPillText}>{story.familiesAssisted} عائلة</Text>
              </View>
            ) : null}
            <View style={styles.metricPill}>
              <CheckCircle2 size={14} color={civic.teal} />
              <Text style={styles.metricPillText}>حضور مؤكد</Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <PrimaryButton
              label={t('outcome.closeBtn')}
              onPress={onClose}
              icon={<Sparkles size={15} color="#fff" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 34, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: civicRadius.xl,
    padding: 24,
    alignItems: 'center',
    ...civicShadow.card,
  },
  badgeWrap: {
    marginBottom: 12,
  },
  heartCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: civic.text,
    textAlign: 'center',
  },
  storySub: {
    fontSize: 13,
    color: civic.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  headlineCard: {
    width: '100%',
    backgroundColor: civic.canvas,
    borderRadius: civicRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: civic.borderHover,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: civic.teal,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 12,
    color: civic.text,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: civic.borderHover,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  metricPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: civic.text,
  },
});
