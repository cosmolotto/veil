import { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS } from '../../lib/constants';

interface VeilCardProps extends PropsWithChildren {
  style?: ViewStyle | ViewStyle[];
}

export function VeilCard({ children, style }: VeilCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: 16,
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
