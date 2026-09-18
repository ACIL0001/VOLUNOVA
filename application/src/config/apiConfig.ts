import { NativeModules, Platform } from 'react-native';

/**
 * Default LAN IP of the computer running the VOLUNOVA backend server.
 * Used as fallback when testing via Expo Go on physical mobile devices.
 */
export const DEFAULT_LAN_IP = '192.168.100.2';
export const BACKEND_PORT = 5000;

/**
 * Dynamically resolves the reachable backend API base URL for any environment:
 * - Physical smartphone via Expo Go (extracts computer's LAN IP from Metro bundle URL)
 * - Android Emulator (10.0.2.2)
 * - Web browser (window.location.hostname or 127.0.0.1)
 */
let customBackendIp: string | null = null;

export function setCustomBackendIp(ip: string | null) {
  customBackendIp = ip;
}

export function getBackendUrl(): string {
  if (customBackendIp) {
    return `http://${customBackendIp}:${BACKEND_PORT}/api`;
  }

  // 1. Web environment (always use 127.0.0.1 instead of localhost to bypass 30s Windows IPv6 timeout)
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      const host =
        window.location.hostname === 'localhost' || window.location.hostname === '::1'
          ? '127.0.0.1'
          : window.location.hostname;
      return `http://${host}:${BACKEND_PORT}/api`;
    }
    return `http://127.0.0.1:${BACKEND_PORT}/api`;
  }

  // 2. Physical device or simulator running via Metro Bundler (Expo)
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (
      match &&
      match[1] &&
      match[1] !== 'localhost' &&
      match[1] !== '127.0.0.1' &&
      match[1] !== '10.0.2.2'
    ) {
      return `http://${match[1]}:${BACKEND_PORT}/api`;
    }
  }

  // 3. For physical mobile devices on Wi-Fi (Expo Go on iPhone & Android)
  return `http://${DEFAULT_LAN_IP}:${BACKEND_PORT}/api`;
}
