import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID || 'mock_app_id';
const key = process.env.PUSHER_KEY || 'mock_key';
const secret = process.env.PUSHER_SECRET || 'mock_secret';
const cluster = process.env.PUSHER_CLUSTER || 'eu';

export const pusherServer = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});

export async function triggerRealtimeEvent(channel: string, event: string, data: any) {
  try {
    if (process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
      await pusherServer.trigger(channel, event, data);
    } else {
      console.log(`[Pusher Mock] Realtime broadcast -> Channel: ${channel} | Event: ${event} | Data:`, data);
    }
  } catch (err: any) {
    console.warn(`[Pusher Warning] Trigger failed for ${channel}/${event}: ${err.message}`);
  }
}
