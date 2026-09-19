import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '../context/LanguageContext';

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
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Sheet Header */}
          <View style={[styles.headerRow, { flexDirection }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              <Text style={[styles.title, { textAlign }]}>{t('notifications.title') || 'Notifications'}</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          {unreadCount > 0 && (
            <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.markAllReadText}>
                  {t('notifications.markAllRead') || 'Tout marquer comme lu'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#38BDF8" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>📭</Text>
              <Text style={styles.emptyText}>
                {t('notifications.empty') || 'Aucune notification pour le moment'}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 24 }}>
              {notifications.map((notif) => {
                const isUnread = !notif.readAt;
                const isSelection =
                  notif.type === 'mission_matched' ||
                  notif.type === 'application_accepted' ||
                  notif.type === 'mission_selected';

                return (
                  <View
                    key={notif._id}
                    style={[styles.notifCard, isUnread && styles.notifCardUnread]}
                  >
                    <View style={[styles.cardHeader, { flexDirection }]}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                          {isSelection ? '🎉 ' + (t('notifications.selectedBadge') || 'Sélectionné(e)') : 'ℹ️ Info'}
                        </Text>
                      </View>
                      <Text style={styles.timeText}>{formatRelativeTime(notif.createdAt)}</Text>
                    </View>

                    <Text style={[styles.messageText, { textAlign }]}>
                      {notif.payload?.message ||
                        `Vous avez été invité(e) pour le rôle "${notif.payload?.roleName || 'Bénévole'}" sur la mission "${notif.payload?.missionTitle || 'Mission'}".`}
                    </Text>

                    {notif.payload?.missionId && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          onSelectMission(notif.payload.missionId!, notif.payload.needId);
                          onClose();
                        }}
                      >
                        <Text style={styles.actionBtnText}>
                          👉 {t('notifications.viewMission') || 'Voir la mission & Confirmer'}
                        </Text>
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
    backgroundColor: 'rgba(6, 10, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: 'bold',
  },
  actionsRow: {
    paddingVertical: 10,
    justifyContent: 'flex-end',
  },
  markAllReadText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  listScroll: {
    marginTop: 8,
  },
  notifCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  notifCardUnread: {
    backgroundColor: '#162235',
    borderColor: '#38BDF8',
    borderLeftWidth: 3,
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    color: '#64748B',
    fontSize: 11,
  },
  messageText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: '#0D7A6F',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
