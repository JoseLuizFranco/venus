# Venus 🪐

App pessoal iOS (React Native + Expo). Por enquanto: **hello world** em dark theme.

O objetivo é distribuir via **AltStore** usando uma *source* própria, hospedada no
**GitHub Pages** deste repositório — sem precisar de Mac, gerando o `.ipa` na nuvem com
**EAS Build**.

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

## Gerar o `.ipa` para o AltStore (build na nuvem, sem Mac)

O `.ipa` de iOS precisa da toolchain da Apple. Como estamos no Linux, usamos o **EAS Build**,
que compila na nuvem da Expo.

```bash
npx eas-cli login          # crie a conta grátis em expo.dev
npx eas-cli init           # grava o projectId em app.json
npx eas-cli build --platform ios --profile preview
```

> **Assinatura / conta Apple:** o EAS precisa de credenciais Apple para exportar o `.ipa`
> (você as informa durante o build). O **AltStore** re-assina o app com o seu Apple ID grátis
> na instalação, então o app roda mesmo sem conta paga (validade de 7 dias por assinatura,
> renovada pelo AltServer).

## Distribuição pela source (GitHub Pages)

A pasta [`docs/`](docs/) é publicada via GitHub Pages e serve como a source do AltStore:

- `docs/source.json` — catálogo da source (lido pela AltStore)
- `docs/index.html` — página com botão **Adicionar à AltStore**
- `docs/icon.png` / `docs/logo.png`

URL da source: `https://joseluizfranco.github.io/venus/source.json`

Para publicar uma nova versão:

1. `git tag v1.0.0 && git push origin v1.0.0` — dispara o workflow que builda o `.ipa` no
   EAS e cria uma **GitHub Release** com o arquivo.
2. Atualize `docs/source.json` (`version`, `date`, `downloadURL`, `size`) e faça push.
3. No iPhone, no AltStore: **Browse → Sources → +** e cole a URL da source (ou use o botão
   da página do Pages).

## CI/CD

- **`.github/workflows/ci.yml`** — a cada push/PR: type-check, `expo-doctor` e bundle de iOS.
- **`.github/workflows/release-ios.yml`** — em tags `v*`: build do `.ipa` no EAS e publicação
  como GitHub Release. Requer o secret `EXPO_TOKEN` e as credenciais Apple já configuradas no
  EAS.

## Estrutura

```
App.tsx                     # tela hello world (dark theme + logo)
app.json                    # config do Expo (nome Venus, dark, bundle id)
eas.json                    # perfis de build EAS
assets/logo.png             # logo da Venus
assets/icon.png             # ícone do app (gerado da logo)
docs/                       # site do GitHub Pages = source do AltStore
.github/workflows/          # CI e release do .ipa
```
