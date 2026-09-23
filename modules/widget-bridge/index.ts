import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

type WidgetBridge = {
  appGroup(): string | null;
  setSnapshot(json: string): boolean;
};

// Só existe no iOS nativo (não no Expo Go nem na web).
const native =
  Platform.OS === 'ios' ? requireOptionalNativeModule<WidgetBridge>('WidgetBridge') : null;

export function setWidgetSnapshot(json: string): boolean {
  return native?.setSnapshot(json) ?? false;
}

export function widgetAppGroup(): string | null {
  return native?.appGroup() ?? null;
}
