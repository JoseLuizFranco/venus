# Venus 🪐

App pessoal iOS (React Native + Expo). Por enquanto: **hello world** em dark theme.

O objetivo é distribuir via **AltStore** usando uma *source* própria, hospedada no
**GitHub Pages** deste repositório — **sem Mac, sem conta Apple paga**. O `.ipa` é
compilado (não-assinado) num runner macOS do GitHub Actions, gratuito para repos públicos,
e a **AltStore re-assina o app com o seu Apple ID grátis** na instalação.

## Stack

- Expo SDK 57 / React Native 0.86 / React 19
- Bundle ID: `com.sliftio.venus`
- Tema dark `#0C0C25`, logo em `assets/logo.png`

## Rodar em desenvolvimento (sem Mac)

```bash
npm install
npx expo start
```

- **No iPhone:** instale o app **Expo Go** e escaneie o QR code.
- **No navegador:** tecle `w` no terminal do Expo.

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
- **`.github/workflows/release-ios.yml`** — em tags `v*` (ou disparo manual): compila o `.ipa`
  não-assinado no runner macOS, publica a Release e atualiza a source. **Sem secrets, sem
  conta Apple.**

## Estrutura

```
App.tsx                     # tela hello world (dark theme + logo)
app.json                    # config do Expo (nome Venus, dark, bundle id)
assets/logo.png             # logo da Venus
assets/icon.png             # ícone do app (gerado da logo)
docs/                       # site do GitHub Pages = source do AltStore
.github/workflows/          # CI e release do .ipa
```
