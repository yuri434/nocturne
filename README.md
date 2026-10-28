# Yuri Music

Player de música para **Windows e Android**, versão **0.7.1**, com interface minimalista e temas personalizados.

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

## Validação da versão 0.7.0

16 testes automatizados passaram. Temas claros/escuros, navegação e controles foram conferidos em WebView com tamanhos de PC e celular. O APK foi compilado e sua assinatura verificada; não houve teste desta versão em aparelho Android físico.

### Correção 0.7.0

Destaques preservam o tom da cor secundária quando precisam de contraste. Barras de volume/progresso e controles acompanham o tema; textos principais mantêm contraste automático.

## Atualizador e notificações — 0.7.0

Instale manualmente esta versão uma vez. As versões futuras aparecem em **Configurações → Atualizações** e no **sino**.

- Verificação ao abrir, periodicamente com o app aberto e por botão manual.
- Downloads somente das releases oficiais de `yuri434/yuri-music`, com SHA-256 conferido antes da instalação.
- Windows: helper separado aguarda o player fechar, mantém backup dos arquivos substituídos, restaura em caso de falha e reabre o app. A pasta do aplicativo precisa permitir gravação.
- Android: confere pacote e assinatura, pede autorização para instalar aplicativos se necessário e abre o instalador do sistema. A confirmação do Android continua necessária.
- Biblioteca, preferências e músicas locais ficam preservadas.

No perfil de um artista, toque em **Seguir artista**. O catálogo inicial é salvo sem avisar sobre lançamentos antigos. Novidades disponíveis na fonte são verificadas ao abrir e a cada 30 minutos com o app aberto. O sino reúne os avisos, com opção de marcar como lidos e gerenciar artistas seguidos. Não há serviço de push nem verificação com o aplicativo encerrado; a fonte pode atrasar ou omitir lançamentos.

16 testes JavaScript, 11 verificações nativas do atualizador e um ensaio de fechamento/substituição/reabertura com aplicativo de teste passaram. Os avisos de uma versão futura e de um lançamento foram simulados na interface; consulta real de releases e perfil de artista também foram verificadas. A instalação Android precisa ser validada em aparelho físico.

Veja [como preparar as próximas releases](docs/RELEASES.md). Não remova o arquivo de checksums nem troque a assinatura do Android.

## Discord: capa da música — 0.7.1

No Windows, a presença envia a capa pública da faixa atual. Sem capa válida, o Discord mantém a imagem da aplicação. Não requer novo token ou alteração no Application ID. Foram testadas validação e transmissão do payload em IPC isolado; a renderização final e o cache dependem do cliente Discord.
