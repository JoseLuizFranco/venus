import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme';

export type Tile = {
  key: string;
  label: string; // overline
  value: string; // número/texto grande
  caption: string; // linha de apoio
  onPress: () => void;
};

type Props = {
  tiles: Tile[];
};

// Grade 2×N de atalhos. Cada tile é só borda fina + tipografia; o valor
// grande mostra o estado atual (ex.: "2/4") e o toque abre a folha de edição.
export function QuickAccess({ tiles }: Props) {
  return (
    <View style={styles.grid}>
      {tiles.map((t) => (
        <Pressable
          key={t.key}
          onPress={t.onPress}
          accessibilityRole="button"
          accessibilityLabel={`${t.label}: ${t.value}, ${t.caption}`}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Text style={styles.label}>{t.label}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {t.value}
          </Text>
          <Text style={styles.caption} numberOfLines={1}>
            {t.caption}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    // duas colunas: metade da largura menos metade do gap
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  pressed: {
    opacity: 0.55,
  },
  label: {
    fontSize: type.overline - 1,
    letterSpacing: 2,
    color: colors.textFaint,
  },
  value: {
    fontSize: type.title,
    fontWeight: '200',
    color: colors.text,
    marginTop: 2,
  },
  caption: {
    fontSize: type.caption,
    color: colors.textMuted,
  },
});
