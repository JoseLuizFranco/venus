import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Field } from '../components/Field';
import { Sheet } from '../components/Sheet';
import { TextButton } from '../components/TextButton';
import { useDb } from '../db';
import { ANNIVERSARY_KEY, setReflection, setSetting, type Reflection } from '../db/reflection';
import { isValidKey } from '../dates';
import { colors, type } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  reflection: Reflection | null;
  anniversary: string | null;
  onChanged: () => Promise<void>;
};

// Folha "Reflection": edita hanzi/pinyin/significado/frase e a data de
// referência do contador de dias.
export function ReflectionSheet({ visible, onClose, reflection, anniversary, onChanged }: Props) {
  const db = useDb();
  const [hanzi, setHanzi] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [quote, setQuote] = useState('');
  const [date, setDate] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setHanzi(reflection?.hanzi ?? '');
    setPinyin(reflection?.pinyin ?? '');
    setMeaning(reflection?.meaning ?? '');
    setQuote(reflection?.quote ?? '');
    setDate(anniversary ?? '');
    setSaved(false);
  }, [visible, reflection, anniversary]);

  const valid =
    hanzi.trim().length > 0 &&
    pinyin.trim().length > 0 &&
    meaning.trim().length > 0 &&
    quote.trim().length > 0 &&
    (date.trim() === '' || isValidKey(date.trim()));

  const save = async () => {
    if (!valid) return;
    const changedText =
      hanzi.trim() !== reflection?.hanzi ||
      pinyin.trim() !== reflection?.pinyin ||
      meaning.trim() !== reflection?.meaning ||
      quote.trim() !== reflection?.quote;
    if (changedText) await setReflection(db, { hanzi, pinyin, meaning, quote });
    if (date.trim() !== '' && date.trim() !== anniversary) {
      await setSetting(db, ANNIVERSARY_KEY, date.trim());
    }
    await onChanged();
    setSaved(true);
  };

  return (
    <Sheet visible={visible} title="REFLECTION" onClose={onClose}>
      <View style={styles.preview}>
        <Text style={styles.hanzi}>{hanzi || '—'}</Text>
        <Text style={styles.pinyin}>{pinyin}</Text>
      </View>

      <Field label="HANZI" value={hanzi} onChangeText={setHanzi} placeholder="坚持" />
      <Field label="PINYIN" value={pinyin} onChangeText={setPinyin} placeholder="Jiānchí" autoCapitalize="none" />
      <Field label="MEANING" value={meaning} onChangeText={setMeaning} placeholder="Perseverance" />
      <Field label="QUOTE" value={quote} onChangeText={setQuote} placeholder="No risk, no story." multiline />
      <Field label="TOGETHER SINCE" value={date} onChangeText={setDate} hint="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation" />

      <View style={styles.actions}>
        <TextButton label={saved ? 'SAVED ✓' : 'SAVE'} onPress={save} disabled={!valid} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  hanzi: {
    fontSize: 64,
    fontWeight: '300',
    color: colors.text,
    lineHeight: 76,
  },
  pinyin: {
    fontSize: type.overline,
    letterSpacing: 4,
    color: colors.textFaint,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
  },
});
