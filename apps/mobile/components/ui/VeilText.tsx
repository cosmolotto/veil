import { PropsWithChildren } from 'react';
import { Text, TextProps } from 'react-native';
import { COLORS } from '../../lib/constants';

export function VeilText({ children, style, ...rest }: PropsWithChildren<TextProps>) {
  return (
    <Text style={[{ color: COLORS.white }, style]} {...rest}>
      {children}
    </Text>
  );
}
