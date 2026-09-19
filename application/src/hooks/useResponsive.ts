import { DimensionValue, useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isPhone = width < 768;
  const compact = width < 420;
  const pad = compact ? 12 : isPhone ? 16 : 24;
  const contentMaxWidth: DimensionValue = isPhone ? '100%' : 720;
  const logoHeight = compact ? 36 : isPhone ? 44 : 52;
  const tabBarHeight = 60;
  const columns = width > 900 ? 3 : width > 600 ? 2 : 1;

  return {
    width,
    height,
    isPhone,
    compact,
    pad,
    contentMaxWidth,
    logoHeight,
    tabBarHeight,
    columns,
  };
}
