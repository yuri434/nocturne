# Yuri Music

Player de música para **Windows e Android**, versão **0.8.0**, com interface minimalista e temas personalizados.

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

## Artista no status do Discord — 0.7.2

A presença Windows define `status_display_type=1` para usar o campo `state` (artista) no texto de status. O comportamento é documentado na lista de membros do Discord. O painel compacto da própria conta pode continuar exibindo o nome da aplicação, pois esse layout é controlado pelo cliente Discord. Nome da faixa, artista e capa continuam no cartão de atividade. 15 verificações de payload/IPC isolado passaram; renderização real do painel ainda não foi confirmada.

## Álbuns pelos cards da Início — 0.7.3

Clicar na capa ou no título abre o álbum da música. Sem álbum informado ou disponível, abre a busca de músicas do artista; sem artista, usa o título da faixa. O botão ▶ separado sempre reproduz a seleção diretamente. A navegação preserva a reprodução atual. Em Aparência, a opção Abrir álbum ao clicar nas músicas da Início pode ser desligada para restaurar o clique que apenas reproduz.

Abertura real de álbum, reprodução separada e preferência verificadas em WebView; ausência de metadados de álbum simulada para validar a busca alternativa. 16 testes automatizados passaram. Sem teste físico do APK.

## Nome da faixa clicável no player — 0.7.4

O título no player inferior, painel lateral e Agora tocando abre o álbum, usando a busca alternativa de músicas do artista quando não há álbum disponível. Ao passar o mouse ou focar pelo teclado, o texto usa a cor secundária legível do tema e sublinhado. O clique preserva a faixa atual; no celular, não dispara também o player expandido. Clique, teclado e regra de destaque verificados em WebView; APK compilado e assinado, sem teste físico.

## Atalho fixado e Início no topo — 0.7.5

Ícone DIB incorporado no executável Windows e identificação estável da aplicação. Depois de atualizar, desfixe o atalho antigo e fixe novamente uma vez para renovar o ícone armazenado pelo Windows. Botão Início à esquerda da pesquisa, minimalista e seguindo a cor secundária. Verificados extração do ícone do executável, navegação no WebView e 16 testes; Android compilado e assinatura validada, sem teste físico.

A faixa atual recebe uma moldura quadrada na cor secundária, na Início e nas listas. O destaque acompanha a troca da faixa e de tema.

## Capas e tempo no Discord — 0.7.6

Solicita capas de 768 pixels ao CDN quando o endereço permite, preservando a identidade da imagem e a original como alternativa. Funciona também para capas salvas antes desta versão. Teste real encontrou a capa do exemplo em 120×120 e confirmou a versão em 768×768. A resolução final depende da fonte.

Discord usa duração finita do áudio, com alternativa pela duração dos metadados, atualiza em carregamento/alteração de duração/busca na faixa e não envia timestamps inválidos quando o total é desconhecido. 20 testes JS e verificação nativa dos timestamps aprovados; interface verificada no WebView. APK compilado e assinatura validada, sem aparelho físico; exibição final da atividade depende do Discord.

## Destaque dos nomes ao passar o mouse — 0.7.7

Nomes de músicas nas listas e cards da Início usam a cor secundária legível ao passar o mouse. O foco pelo teclado recebe o mesmo destaque. Verificados a regra CSS e sua aplicação de cor com simulação controlada no WebView oculto.

## Cabeças personalizáveis — 0.7.8

Clique na cabeça do cabeçalho ou em Aparência → Personalizar cabeça. Creeper, Zumbi, Enderman e Steve com prévias. Modos: seguir tema, cor original e cor personalizada independente do tema. Escolha salva no aparelho e incluída no backup/sincronização. Windows atualiza também os ícones da janela e da bandeja em execução; o atalho fixado e o ícone do launcher Android continuam com a identidade padrão.

Seleção, cores, validação do backup e layout verificados em WebView em 1280 e 390 pixels. Ícones nativos DIB testados para quatro cabeças e modo original/personalizado. APK compilado e assinatura validada, sem aparelho físico. As faces adicionais são desenhos de pixels definidos em código, inspirados nas referências enviadas.

## Destaque da linha inteira ao passar o mouse — 0.7.9

Hover nas linhas e cards aplica a mesma moldura e fundo da faixa atual, usando a cor secundária do tema. Ao sair, o destaque transitório desaparece e a faixa atual permanece marcada. Também disponível ao focar os controles pelo teclado. Verificados estilos calculados em simulação controlada de hover no WebView, mudança de tema e preservação da seleção de reprodução.

## Janela integrada, última reprodução e rádio — 0.8.0

Windows remove a barra branca e integra minimizar/maximizar/fechar ao topo do app, com regiões de arraste e redimensionamento. Maximização respeita a área de trabalho e maximizar o miniplayer retorna à interface completa.

A sessão salva faixa atual, ponto e até 500 músicas da fila em arquivo separado e armazenamento local. Ao reabrir, a faixa aparece pausada; ao tocar, o áudio é resolvido novamente e retorna ao ponto salvo após carregar os metadados. Grava a cada 5 segundos e em mudanças de reprodução/visibilidade; no fechamento normal do Windows captura o ponto final. Encerramento forçado pode perder os últimos segundos. A sessão não entra no backup da biblioteca.

Continuação automática ativada por padrão fora de álbuns: perto do fim da fila, consulta a rádio da faixa no YouTube Music, embaralha recomendações relacionadas, remove IDs já na fila e adiciona até 15. Não altera filas de álbum nem repetição; opção em Configurações → Som. Gênero/estilo seguem as recomendações disponíveis da fonte. Sem rede ou sugestões novas, mantém a fila existente.

Validação: 26 testes JS aprovados; janela sem borda, controles, maximização na área útil e miniplayer verificados em instância isolada; reinicialização recuperou faixa pausada em 0:43; motor empacotado retornou 25 recomendações reais com duração e capa. Windows e APK compilados; assinatura Android validada. Sem teste em aparelho Android físico.

## Noctune — prévia Spotify

A migração de marca e fonte Spotify está em [previews/spotify](previews/spotify/README.md). A versão estável continua sendo 0.8.0 até validar reprodução autenticada. A prévia preserva o modo YouTube Music como alternativa.
