// Extensão WidgetKit (widgets pequenos da home screen do iPhone).
// Os arquivos .swift desta pasta são linkados ao target pelo
// @bacons/apple-targets no `expo prebuild`; nada aqui é React Native.

/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'VenusWidget',
  displayName: 'Venus',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  colors: {
    $accent: '#FCB69F',
    $widgetBackground: '#0C0C25',
  },
  entitlements: {
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
