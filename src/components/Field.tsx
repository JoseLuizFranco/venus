import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, type } from '../theme';

type Props = TextInputProps & {
  label: string;
  hint?: string; // ex.: formato esperado
};

// Campo de texto: rótulo em overline, entrada só com linha inferior.
export function Field({ label, hint, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        style={[styles.input, style]}
        {...rest}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    marginBottom: 18,
  },
  label: {
    fontSize: type.overline - 1,
    letterSpacing: 2,
    color: colors.textFaint,
  },
  input: {
    fontSize: type.label,
    color: colors.text,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  hint: {
    fontSize: type.caption - 1,
    color: colors.done,
  },
});
