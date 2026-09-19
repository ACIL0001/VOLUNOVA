import { Platform, Vibration } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { isRunningInExpoGo } from 'expo';
import { getBackendUrl } from '../config/apiConfig';

let cachedNotificationsModule: any = undefined;

/**
 * Robustly checks if running inside Expo Go on Android.
 * In Expo SDK 53+, all native push notification binaries (such as ExpoTopicSubscriptionModule,
 * ExpoPushTokenManager) were completely stripped from the Expo Go Android client.
 * Attempting to require('expo-notifications') inside Expo Go crashes with:
 * "Cannot find native module 'ExpoTopicSubscriptionModule'".
 */
function isAndroidExpoGo(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    if (Constants?.appOwnership === 'expo') return true;
    if (Constants?.executionEnvironment === ExecutionEnvironment.StoreClient) return true;
  } catch {}

  try {
    if (typeof isRunningInExpoGo === 'function' && isRunningInExpoGo()) return true;
  } catch {}

  // In development mode on Android (e.g. Metro connected to Expo Go),
  // unless explicitly running in a bare or standalone build, treat as Expo Go to guarantee zero crashes
  if (__DEV__) {
    const env = Constants?.executionEnvironment;
    if (!env || env === 'storeClient') {
      return true;
    }
  }

  return false;
}

/**
 * Safely loads expo-notifications module only if running in an environment
 * where the native modules exist (e.g. Development Builds, standalone APKs, iOS).
 * Never loads in Expo Go on Android where SDK 53 completely stripped native notification modules.
 */
function getNotificationsModule() {
  if (cachedNotificationsModule !== undefined) {
    return cachedNotificationsModule;
  }

  if (Platform.OS === 'web' || isAndroidExpoGo()) {
    console.log('📱 [PushService] Running in Expo Go (Android): using real-time Socket.IO + In-App alerts engine.');
    cachedNotificationsModule = null;
    return null;
  }

  try {
    const mod = require('expo-notifications');
    if (mod?.setNotificationHandler) {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: mod.AndroidNotificationPriority?.HIGH,
        }),
      });
    }
    cachedNotificationsModule = mod;
  } catch (err: any) {
    console.warn('📱 [PushService] Native expo-notifications not available:', err.message);
    cachedNotificationsModule = null;
  }

  return cachedNotificationsModule;
}

/**
 * Requests push permissions and registers the Expo push token with the VOLUNOVA backend.
 * Gracefully adapts between Expo Go and development/production builds.
 */
export async function registerPushNotifications(authToken: string): Promise<string | null> {
  const notif = getNotificationsModule();
  if (!notif) {
    return null;
  }

  try {
    if (Platform.OS === 'android' && notif.setNotificationChannelAsync) {
      await notif.setNotificationChannelAsync('default', {
        name: 'VOLUNOVA Notifications',
        importance: notif.AndroidImportance?.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D7A6F',
        sound: 'default',
      });
    }

    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenData = await notif.getExpoPushTokenAsync({
      projectId: undefined,
    });

    const pushToken = tokenData.data;
    console.log('📱 [PushService] Registered Expo Push Token:', pushToken);

    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/notifications/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken }),
    });

    return pushToken;
  } catch (err: any) {
    console.warn('📱 [PushService] Remote push token note:', err?.message || err);
    return null;
  }
}

/**
 * Displays a native local notification banner with sound and vibration on the phone.
 * Also triggers physical phone vibration.
 */
export async function displayLocalNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  if (Platform.OS !== 'web') {
    try {
      Vibration.vibrate([0, 250, 250, 250]);
    } catch {}
  }

  const notif = getNotificationsModule();
  if (notif?.scheduleNotificationAsync) {
    try {
      await notif.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null,
      });
    } catch (err: any) {
      console.warn('📱 [PushService] Could not schedule local notification:', err.message);
    }
  }
}

/**
 * Sets up a listener that triggers when the user taps on a push notification (phone lockscreen or notification tray).
 */
export function setupPushNotificationTapListener(onOpenMission: (missionId: string) => void) {
  const notif = getNotificationsModule();
  if (!notif) return () => {};

  try {
    if (notif.getLastNotificationResponseAsync) {
      notif.getLastNotificationResponseAsync()
        .then((response: any) => {
          if (response) {
            const data = response.notification?.request?.content?.data as Record<string, any> | undefined;
            if (data && typeof data.missionId === 'string') {
              console.log('📱 [PushService] App opened from cold start by tapping notification:', data.missionId);
              onOpenMission(data.missionId);
            }
          }
        })
        .catch(() => {});
    }

    if (notif.addNotificationResponseReceivedListener) {
      const subscription = notif.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification?.request?.content?.data as Record<string, any> | undefined;
        if (data && typeof data.missionId === 'string') {
          console.log('📱 [PushService] User tapped notification for mission:', data.missionId);
          onOpenMission(data.missionId);
        }
      });

      return () => {
        subscription.remove();
      };
    }
  } catch (err: any) {
    console.warn('📱 [PushService] setupPushNotificationTapListener:', err.message);
  }

  return () => {};
}
