Pod::Spec.new do |s|
  s.name           = 'WidgetBridge'
  s.version        = '1.0.0'
  s.summary        = 'Grava os dados dos widgets no App Group e recarrega o WidgetKit.'
  s.author         = ''
  s.homepage       = 'https://github.com/JoseLuizFranco/venus'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.swift'
end
