# Yuri Music

Player de música para **Windows e Android**, versão **0.6.1**, com interface minimalista e temas personalizados.

## Baixar

Os aplicativos prontos ficam em [Releases](https://github.com/yuri434/yuri-music/releases).

- **Windows:** extraia o ZIP e abra `YuriMusic-YouTube.exe`. Requer Windows x64 e Microsoft Edge WebView2 Runtime.
- **Android:** instale o APK. Requer Android 8 ou superior; variantes ARM64 e x86_64.
- Para atualizar no Android, instale por cima, sem desinstalar, para preservar a biblioteca.

## Recursos

- Início com recentes, curtidas e playlists locais.
- Busca de músicas, álbuns e artistas.
- Fila, histórico, repetição e aleatório.
- Cor principal e secundária, contraste automático, temas salvos e presets.
- Fonte Minecraft opcional e ícones minimalistas.
- Equalizador, visualizador, suavização opcional de picos e transição entre faixas.
- Miniplayer, atalhos e presença no Discord no Windows.
- Downloads disponíveis pela fonte, backup e sincronização de biblioteca por arquivo.

## Estrutura

- `windows/src/`: aplicativo C# WinForms/WebView2 e serviço Python.
- `windows/web/`: interface desktop.
- `windows/tests/`: testes de fila, biblioteca e reprodução.
- `android/`: aplicativo Java/WebView com serviço de reprodução e Python via Chaquopy.
- `THIRD_PARTY/`: avisos de componentes de terceiros.

## Desenvolvimento

### Testes da interface

Com Node.js instalado, execute na raiz:

```sh
node --test windows/tests/*.test.mjs
```

### Android

Requer JDK 21, Gradle 8.9, Android SDK 35 e Python 3.12. Defina `ANDROID_HOME` e, se necessário, `YURI_BUILD_PYTHON` com o caminho do Python. Depois:

```sh
gradle -p android assembleDebug
```

O APK será gerado em `android/app/build/outputs/apk/debug/`. O keystore local não faz parte deste repositório. Builds feitos em outro ambiente têm assinatura diferente dos APKs distribuídos e não necessariamente atualizam instalações existentes.

### Windows

Veja [como compilar](docs/BUILD-WINDOWS.md). Os executáveis e dependências prontas são distribuídos separadamente em Releases.

## Limitações e dados

A integração usa `ytmusicapi` e `yt-dlp`, ferramentas não oficiais sujeitas a mudanças na fonte. O projeto não tem vínculo com Spotify, YouTube, Google, Mojang ou Microsoft. Não inclui catálogo de áudio nem licença de músicas; disponibilidade e uso dependem da fonte e dos direitos aplicáveis. Não há garantia de catálogo completo ou qualidade fixa.

Biblioteca e preferências ficam no aparelho; no Windows, em `%LOCALAPPDATA%/YuriMusic/YouTube05`. Não publique backups pessoais nem chaves. A presença Discord usa apenas Application ID público e o Discord desktop aberto.

O arquivo `Minecraft.ttf` e a imagem do ícone foram fornecidos pelo autor do projeto. Não foi atribuída uma licença de redistribuição específica a esses assets. As licenças dos componentes de terceiros permanecem aplicáveis; este repositório ainda não declara uma licença geral para o código próprio.

## Validação da versão 0.6.1

13 testes automatizados passaram. Temas claros/escuros, navegação e controles foram conferidos em WebView com tamanhos de PC e celular. O APK foi compilado e sua assinatura verificada; não houve teste desta versão em aparelho Android físico.

### Correção 0.6.1

Destaques preservam o tom da cor secundária quando precisam de contraste. Barras de volume/progresso e controles acompanham o tema; textos principais mantêm contraste automático.
