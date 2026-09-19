import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, Compass, UserCheck, X } from 'lucide-react-native';
import { useTranslation } from '../context/LanguageContext';
import { civic, civicRadius } from '../theme/civic';

export interface MobileNotification {
  _id: string;
  type: string;
  payload: {
    missionId?: string;
    needId?: string;
    roleName?: string;
    missionTitle?: string;
    volunteerName?: string;
    message?: string;
    title?: string;
  };
  readAt?: string | null;
  createdAt: string;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: MobileNotification[];
  loading: boolean;
  onMarkAllRead: () => void;
  onSelectMission: (missionId: string, needId?: string) => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  notifications,
  loading,
  onMarkAllRead,
  onSelectMission,
}: NotificationsModalProps) {
  const { t, isRTL, textAlign, flexDirection } = useTranslation();

  const formatRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return t('notifications.justNow');
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} j`;
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={[styles.headerRow, { flexDirection }]}>
            <View style={[styles.headerLeft, { flexDirection }]}>
              <Bell size={18} color={civic.teal} />
              <Text style={[styles.title, { textAlign }]}>{t('notifications.title')}</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={civic.muted} />
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.markAll}>{t('notifications.markAllRead')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={civic.teal} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.center}>
              <Bell size={32} color={civic.borderHover} />
              <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
            </View>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 28 }}>
              {notifications.map((notif) => {
                const isUnread = !notif.readAt;
                const isSelection =
                  notif.type === 'mission_matched' ||
                  notif.type === 'application_accepted' ||
                  notif.type === 'mission_selected';

                return (
                  <View
                    key={notif._id}
                    style={[styles.card, isUnread && styles.cardUnread]}
                  >
                    <View style={[styles.cardHeader, { flexDirection }]}>
                      <View style={[styles.typeBadge, { flexDirection }]}>
                        {isSelection ? (
                          <UserCheck size={12} color={civic.teal} />
                        ) : (
                          <Bell size={12} color={civic.teal} />
                        )}
                        <Text style={styles.typeText}>
                          {isSelection
                            ? t('notifications.selectedBadge')
                            : notif.payload?.title || 'Info'}
                        </Text>
                      </View>
                      <Text style={styles.time}>{formatRelativeTime(notif.createdAt)}</Text>
                    </View>

                    <Text style={[styles.message, { textAlign }]}>
                      {notif.payload?.message ||
                        `${t('notifications.selectedBodyPrefix')} "${notif.payload?.roleName || 'Bénévole'}" — ${notif.payload?.missionTitle || 'Mission'}.`}
                    </Text>

                    {notif.payload?.missionId && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { flexDirection }]}
                        onPress={() => {
                          onSelectMission(notif.payload.missionId!, notif.payload.needId);
                          onClose();
                        }}
                      >
                        <Compass size={14} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('notifications.viewMission')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
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
    backgroundColor: civic.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: civic.border,
    maxHeight: '82%',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: civic.track,
  },
  headerLeft: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: civic.navy,
  },
  badge: {
    backgroundColor: civic.red,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    backgroundColor: civic.track,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    paddingVertical: 10,
    justifyContent: 'flex-end',
  },
  markAll: {
    color: civic.teal,
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: civic.mutedSoft,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    marginTop: 8,
  },
  card: {
    backgroundColor: civic.backgroundAlt,
    borderRadius: civicRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: civic.border,
  },
  cardUnread: {
    backgroundColor: civic.tealSoft,
    borderColor: 'rgba(13,122,111,0.28)',
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: civic.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(13,122,111,0.2)',
  },
  typeText: {
    color: civic.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  time: {
    color: civic.mutedSoft,
    fontSize: 11,
  },
  message: {
    color: civic.navy,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: civic.teal,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
