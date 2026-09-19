import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { isRunningInExpoGo } from 'expo';
import { getBackendUrl } from '../config/apiConfig';

// Configure foreground notification behavior (alert, sound, badge)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch (e) {
  console.warn('📱 [PushService] Notification handler init:', e);
}

/**
 * Requests push permissions and registers the Expo push token with the VOLUNOVA backend.
 * Gracefully adapts between Expo Go (using local + socket notifications) and standalone/dev builds.
 */
export async function registerPushNotifications(authToken: string): Promise<string | null> {
  // Push notifications only apply to native mobile devices
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Android notification channel configuration
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'VOLUNOVA Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0D7A6F',
          sound: 'default',
        });
      } catch (channelErr: any) {
        console.warn('📱 [PushService] Android channel config:', channelErr.message);
      }
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('📱 [PushService] Notification permission not granted by user.');
      return null;
    }

    // Expo SDK 53+ removed remote FCM push tokens from Expo Go client on Android.
    // In Expo Go, real-time alerts are handled via Socket.IO + Local Notifications.
    if (isRunningInExpoGo && isRunningInExpoGo() && Platform.OS === 'android') {
      console.log(
        '📱 [PushService] Running in Expo Go on Android. Remote FCM tokens require a development build. Utilizing real-time Socket.IO + Local Notifications for heads-up alerts.'
      );
      return null;
    }

    // Standalone APK / Development Build / iOS
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Resolved automatically
    });

    const pushToken = tokenData.data;
    console.log('📱 [PushService] Registered Expo Push Token:', pushToken);

    // Register token with backend server
    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/notifications/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
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
 * Works seamlessly in Expo Go, development builds, and production.
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
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Deliver immediately
    });
  } catch (err: any) {
    console.warn('📱 [PushService] Could not schedule local notification:', err.message);
  }
}

/**
 * Sets up a listener that triggers when the user taps on a push notification (phone lockscreen or notification tray).
 * When tapped, extracts the missionId and invokes onOpenMission to open that exact mission.
 */
export function setupPushNotificationTapListener(onOpenMission: (missionId: string) => void) {
  if (Platform.OS === 'web') return () => {};

  try {
    // Check if app was opened by tapping a notification while closed
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          const data = response.notification.request.content.data as Record<string, any> | undefined;
          if (data && typeof data.missionId === 'string') {
            console.log('📱 [PushService] App opened from cold start by tapping notification:', data.missionId);
            onOpenMission(data.missionId);
          }
        }
      })
      .catch((e) => console.warn('📱 [PushService] Cold start tap check:', e.message));

    // Listener for taps while app was backgrounded or active
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      if (data && typeof data.missionId === 'string') {
        console.log('📱 [PushService] User tapped notification for mission:', data.missionId);
        onOpenMission(data.missionId);
      }
    });

    return () => {
      subscription.remove();
    };
  } catch (err: any) {
    console.warn('📱 [PushService] setupPushNotificationTapListener:', err.message);
    return () => {};
  }
}
