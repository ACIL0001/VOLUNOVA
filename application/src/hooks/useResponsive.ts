import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isLarge = width >= 1024;
  const isLandscape = width > height;
  const compact = width < 380;
  const columns = width >= 720 ? 2 : 1;
  const contentMaxWidth = Math.min(width, isPhone ? width : isTablet ? 760 : 920);
  const pad = isPhone ? 16 : 24;
  const hPad = isPhone ? 16 : 28;
  const titleSize = compact ? 20 : isPhone ? 22 : 28;
  const logoHeight = compact ? 36 : isPhone ? 44 : 56;
  const tabBarHeight = 58 + Math.max(insets.bottom, 10);

  return {
    width,
    height,
    insets,
    isPhone,
    isTablet,
    isLarge,
    isLandscape,
    compact,
    columns,
    contentMaxWidth,
    pad,
    hPad,
    titleSize,
    logoHeight,
    tabBarHeight,
  };
}
