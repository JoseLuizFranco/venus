# Venus 🪐

App pessoal iOS (React Native + Expo). Home tipográfica em dark theme com widgets de acesso
rápido (academia, agenda, peso, reflexão) e um banco **SQLite local** (`expo-sqlite`) onde
tudo é gravado no aparelho — sem backend.

O objetivo é distribuir via **AltStore** usando uma *source* própria, hospedada no
**GitHub Pages** deste repositório — **sem Mac, sem conta Apple paga**. O `.ipa` é
compilado (não-assinado) num runner macOS do GitHub Actions, gratuito para repos públicos,
e a **AltStore re-assina o app com o seu Apple ID grátis** na instalação.

## Stack

- Expo SDK 57 / React Native 0.86 / React 19
- Banco local: `expo-sqlite` (arquivo `venus.db`, migrações via `PRAGMA user_version`)
- Clima: localização do iPhone via `expo-location` + Open-Meteo (grátis, sem chave). O WeatherKit
  da Apple exige o Developer Program pago, incompatível com a distribuição por AltStore.
- Bundle ID: `com.sliftio.venus`
- Tema dark `#0C0C25`, logo em `assets/logo.png`

## Rodar em desenvolvimento (sem Mac)

```bash
npm install
npx expo start
```

- **No iPhone:** instale o app **Expo Go** e escaneie o QR code.
- **No navegador:** tecle `w` no terminal do Expo. *Obs.: o `expo-sqlite` não roda na web sem
  configurar o WASM no Metro; use o Expo Go ou o simulador.*

## Gerar o `.ipa` (grátis, sem Mac e sem conta Apple)

Não usamos EAS/Apple Developer Program. O workflow **Release iOS** compila o app num runner
**macOS do GitHub Actions** com `xcodebuild` **sem code signing**, empacota o `.app` num
`.ipa` e publica como GitHub Release. Runners macOS são gratuitos em repositórios públicos.

Como funciona a assinatura: a **AltStore** pega esse `.ipa` não-assinado e o re-assina no seu
iPhone com o seu **Apple ID grátis** na hora de instalar (validade de 7 dias por assinatura,
renovada automaticamente pelo AltServer rodando no seu PC/Mac). Nenhuma conta paga envolvida.

> **Rodar no aparelho durante o dev:** o jeito mais rápido continua sendo o app **Expo Go**
> (`npx expo start` + QR code) — não gera `.ipa`, mas é instantâneo.

## Distribuição pela source (GitHub Pages)

A pasta [`docs/`](docs/) é publicada via GitHub Pages e serve como a source do AltStore:

- `docs/source.json` — catálogo da source (lido pela AltStore)
- `docs/index.html` — página com botão **Adicionar à AltStore**
- `docs/icon.png` / `docs/logo.png`

URL da source: `https://joseluizfranco.github.io/venus/source.json`

Para publicar uma nova versão:

1. Suba a versão em `app.json` e crie a tag: `git tag v1.0.0 && git push origin v1.0.0`.
   O workflow builda o `.ipa`, cria a **GitHub Release** e **atualiza o `docs/source.json`
   sozinho** (versão, data, tamanho, URL do download).
2. No iPhone, no AltStore: **Browse → Sources → +** e cole a URL da source (ou use o botão
   da página do Pages).

## CI/CD

- **`.github/workflows/ci.yml`** — a cada push/PR: type-check, `expo-doctor` e bundle de iOS.
- **`.github/workflows/release-ios.yml`** — a cada merge na `main` (ou tag `v*`, ou disparo
  manual): compila o `.ipa` não-assinado no runner macOS, publica a Release e atualiza a
  source. **Sem secrets, sem conta Apple.**

## Widgets da home screen

Extensão WidgetKit em SwiftUI (`targets/widget/`, gerada no `expo prebuild` pelo
`@bacons/apple-targets`), com dois widgets pequenos:

- **Together** — dias de namoro e uma expressão em mandarim que muda à meia-noite (lista em
  `TogetherWidget.swift`).
- **Academia** — treinos feitos na semana (seg → dom) e o próximo da fila.

O app grava um snapshot (data de início + treinos) no App Group `group.com.sliftio.venus`
via o módulo local `modules/widget-bridge` sempre que a home recarrega. A AltStore registra
o grupo como `group.com.sliftio.venus.<TEAMID>` e informa o nome real em `ALTAppGroups` no
`Info.plist`; app e widget resolvem o grupo por aí. Como o `.ipa` sai sem assinatura, o CI
embute os entitlements nos binários com `ldid` para a AltStore enxergar o App Group.

Com Apple ID grátis, app + widget ocupam **2 dos 3 App IDs** ativos permitidos.
Tocar num widget abre a folha correspondente no app (`venus://gym`, `venus://reflection`).

## Estrutura

```
App.tsx                     # home: header, quick access, academia, calendário, reflection
app.json                    # config do Expo (nome Venus, dark, bundle id, plugin expo-sqlite)
src/theme.ts                # tokens de design (cores, espaçamento, tipografia)
src/dates.ts                # helpers de data (YYYY-MM-DD, semana seg→dom)
src/db/schema.ts            # migrações SQL (workouts, exercises, workout_logs, events,
                            # weights, reflections, settings)
src/db/seed.ts              # dados iniciais gravados na primeira abertura
src/db/index.tsx            # DbProvider (abre o banco, roda migrações + seed) e useDb()
src/db/{workouts,events,weights,reflection}.ts   # repositórios (queries)
src/hooks/useHomeData.ts    # carrega tudo que a home mostra + refresh()
src/weather.ts              # localização atual → Open-Meteo, com cache de 30 min no SQLite
src/hooks/useWeather.ts     # clima no header; atualiza ao voltar ao primeiro plano
src/components/             # CheckRow, WeekStrip, QuickAccess, Sheet, Field, TextButton…
src/screens/                # folhas modais: GymSheet, AgendaSheet, WeightSheet, ReflectionSheet
assets/logo.png             # logo da Venus
src/widgets.ts              # snapshot enviado aos widgets da home screen
modules/widget-bridge/      # módulo nativo local: grava no App Group + recarrega o WidgetKit
targets/widget/             # extensão WidgetKit (SwiftUI): Together e Academia
docs/                       # site do GitHub Pages = source do AltStore
.github/workflows/          # CI e release do .ipa
```

## Dados (SQLite)

Tudo fica em `venus.db` no aparelho. Para mudar o esquema, acrescente uma nova string ao
final de `MIGRATIONS` em `src/db/schema.ts` — ela roda uma vez e o `user_version` sobe.

| Tabela          | O que guarda                                                   |
|-----------------|----------------------------------------------------------------|
| `workouts`      | treinos do split semanal (arquivar em vez de apagar)           |
| `exercises`     | exercícios por treino: séries, reps, carga (kg)                |
| `workout_logs`  | um registro por treino concluído numa data (1 por semana na home) |
| `events`        | compromissos: data, hora opcional, título, feito               |
| `weights`       | peso corporal, um registro por dia                             |
| `reflections`   | hanzi/pinyin/significado/frase; só um `active = 1`             |
| `settings`      | chave/valor — ex.: `anniversary_date` do contador "♡ N days"   |
