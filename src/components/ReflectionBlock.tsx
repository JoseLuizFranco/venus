import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  hanzi: string;
  pinyin: string;
  meaning: string;
  quote: string;
  daysTogether: number;
};

// Widget 2 — Reflection. Caractere enorme, pinyin minúsculo, respiro imenso.
// Quase nenhuma decoração: só o coração ganha o tom de destaque.
export function ReflectionBlock({
  hanzi,
  pinyin,
  meaning,
  quote,
  daysTogether,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.hanzi}>{hanzi}</Text>
      <Text style={styles.pinyin}>{pinyin}</Text>
      <Text style={styles.meaning}>{meaning}</Text>

      <Text style={styles.quote}>“{quote}”</Text>

      <Text style={styles.days}>
        <Text style={styles.heart}>♡</Text> {daysTogether} days
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  hanzi: {
    fontSize: 92,
    fontWeight: '300',
    color: colors.text,
    lineHeight: 104,
  },
  pinyin: {
    fontSize: 12,
    letterSpacing: 4,
    color: colors.textFaint,
    marginTop: 10,
  },
  meaning: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 6,
  },
  quote: {
    fontSize: 23,
    fontWeight: '300',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 44,
  },
  days: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 44,
  },
  heart: {
    color: colors.accent,
  },
});
