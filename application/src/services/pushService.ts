import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getBackendUrl } from '../config/apiConfig';

// Configure foreground notification behavior (alert, sound, badge)
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

/**
 * Requests push permissions and registers the Expo push token with the VOLUNOVA backend.
 */
export async function registerPushNotifications(authToken: string): Promise<string | null> {
  // Push notifications only apply to native mobile devices
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('📱 [PushService] Push notification permission not granted by user.');
      return null;
    }

    // Android channel configuration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VOLUNOVA Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D7A6F',
        sound: 'default',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Automatically resolved from app.json
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
    console.warn('📱 [PushService] Could not register push token:', err.message);
    return null;
  }
}

/**
 * Sets up a listener that triggers when the user taps on a push notification (phone lockscreen or notification tray).
 * When tapped, extracts the missionId and invokes onOpenMission to open that exact mission.
 */
export function setupPushNotificationTapListener(onOpenMission: (missionId: string) => void) {
  if (Platform.OS === 'web') return () => {};

  // Check if app was opened by tapping a notification while closed
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      if (data && typeof data.missionId === 'string') {
        console.log('📱 [PushService] App opened from cold start by tapping push notification:', data.missionId);
        onOpenMission(data.missionId);
      }
    }
  });

  // Listener for taps while app was backgrounded
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
}
