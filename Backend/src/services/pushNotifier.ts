/**
 * Service for dispatching mobile push notifications via Expo's Push API.
 * Reaches volunteers on their physical smartphones even when the app is closed/locked.
 */

export interface ExpoPushMessage {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  badge?: number;
}

export async function sendExpoPushNotification({
  pushTokens,
  title,
  body,
  data = {},
}: {
  pushTokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<{ success: boolean; sentCount: number; errors?: any[] }> {
  if (!pushTokens || pushTokens.length === 0) {
    return { success: true, sentCount: 0 };
  }

  // Filter valid Expo push tokens: ExponentPushToken[...] or ExpoPushToken[...]
  const validTokens = pushTokens.filter(
    (t) => typeof t === 'string' && (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
  );

  if (validTokens.length === 0) {
    return { success: true, sentCount: 0 };
  }

  const messages: ExpoPushMessage[] = validTokens.map((to) => ({
    to,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'default',
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = (await response.json()) as any;
    console.log(`📱 [PushNotifier] Dispatched ${messages.length} push notification(s) to Expo service.`);

    return {
      success: response.ok,
      sentCount: messages.length,
      errors: result.errors,
    };
  } catch (err: any) {
    console.warn('⚠️ [PushNotifier] Failed to contact Expo Push API:', err.message);
    return { success: false, sentCount: 0, errors: [err.message] };
  }
}
