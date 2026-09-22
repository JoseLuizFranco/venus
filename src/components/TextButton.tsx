import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, type } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  muted?: boolean; // ação secundária/destrutiva em tom apagado
  disabled?: boolean;
};

// Botão só de texto. Primário em accent; secundário em tom apagado.
export function TextButton({ label, onPress, muted, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [styles.btn, (pressed || disabled) && styles.pressed]}
    >
      <Text style={[styles.label, muted && styles.muted]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.5,
  },
  label: {
    fontSize: type.caption + 2,
    letterSpacing: 1,
    color: colors.accent,
  },
  muted: {
    color: colors.textFaint,
  },
});
