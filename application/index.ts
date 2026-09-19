import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress harmless development-only Metro / HMR WebSocket reconnection warnings
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Disconnected from Metro',
  'Bundle Splitting – Metro disconnected',
]);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
