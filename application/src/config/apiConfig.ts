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
export function getBackendUrl(): string {
  // 1. Web environment
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:${BACKEND_PORT}/api`;
    }
    return `http://127.0.0.1:${BACKEND_PORT}/api`;
  }

  // 2. Physical device or simulator running via Metro Bundler (Expo)
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:${BACKEND_PORT}/api`;
    }
  }

  // 3. Android Emulator without Metro script URL
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${BACKEND_PORT}/api`;
  }

  // 4. Default to current Wi-Fi LAN IP
  return `http://${DEFAULT_LAN_IP}:${BACKEND_PORT}/api`;
}
