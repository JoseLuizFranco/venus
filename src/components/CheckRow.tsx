import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme';

type Props = {
  done: boolean;
  label: string;
  meta?: string; // ex.: hora, exibida acima do label
  onToggle: () => void;
};

// Linha marcável: ○ vira ✓. Sem checkbox, sem caixa — só o glifo e o texto.
export function CheckRow({ done, label, meta, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={[styles.mark, done && styles.markDone]}>{done ? '✓' : '○'}</Text>
      <View style={styles.body}>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 15,
  },
  pressed: {
    opacity: 0.55,
  },
  mark: {
    width: 22,
    fontSize: 19,
    color: colors.textFaint,
    textAlign: 'center',
  },
  markDone: {
    color: colors.accent,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  meta: {
    fontSize: type.caption,
    letterSpacing: 1,
    color: colors.textFaint,
  },
  label: {
    fontSize: type.label,
    color: colors.text,
  },
  labelDone: {
    color: colors.done,
  },
});
