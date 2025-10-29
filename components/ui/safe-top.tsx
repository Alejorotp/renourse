import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeTop: React.FC<{ backgroundColor?: string }> = ({ backgroundColor = 'transparent' }) => {
  const insets = useSafeAreaInsets();
  const height = Math.max(0, insets.top || 0);
  return <View style={{ height, backgroundColor }} />;
};

export default SafeTop;
