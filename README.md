# Nocturne 0.12.0

Nocturne para Windows e Android, com o cliente YouTube Music do [Meiro](https://github.com/elianiva/meiro), revisão `67792edd6350b4fad54bbbea27a3b9acafe6c3bd`. O cliente Go em `shared/youtube` é reaproveitado sob GPLv3, com correções Nocturne para cabeçalhos responsivos e navegação de álbuns, sem dados simulados. Compila para WebAssembly e é compartilhado pelas duas interfaces; o transporte e as credenciais ficam nos hosts nativos.

## Usar

Windows: extraia o ZIP completo e abra **Nocturne.exe**. Android: instale o APK correspondente à sua instalação. O principal mantém `com.yuri.music.youtube`; o APK preview-update mantém `com.yuri.music.noctune.preview`. Não desinstale para atualizar.

A busca e o áudio funcionam sem conta quando o YouTube os disponibiliza. Para biblioteca, recomendações pessoais, curtidas e playlists da conta, abra Configurações → Conta YouTube Music. O login abre o navegador normal no Windows e Android. A sessão não é capturada automaticamente: após entrar, a conexão ao app exige importar a própria sessão no campo nativo protegido. O Google pode recusar uma WebView: a recusa é mostrada e não é contornada. A importação avançada de uma sessão própria usa um campo nativo protegido; nunca envie cookies ou senhas em chats.

## Preservado e alterado

- Nome Nocturne, temas com duas cores, densidade, miniplayer, Discord, controles de mídia, fila, playlists locais, backups, notificações e atualização.
- Mascote vampira original em lugar do Creeper, incluindo ícones, janela, bandeja e abertura Android.
- Layout Material 3 inspirado nas métricas e telas do Meiro, com fonte Google Sans (OFL), navegação lateral no PC e navegação para toque no celular. As cores salvas do usuário prevalecem.
- Busca com filtros e continuações reais, início/explorar/biblioteca/retrospectiva, álbuns, artistas, playlists, podcasts, letras e rádio pelo cliente original. Menus de botão direito e toque prolongado.
- Recursos da conta: curtir, seguir/deixar de seguir, salvar biblioteca, criar/excluir playlists e adicionar faixas. Playlists locais continuam independentes.
- Áudio direto do cliente Meiro, equalizador/visualizador do Nocturne e downloads locais. O player Spotify anterior continua opcional para não invalidar faixas e preferências salvas.

## Compatibilidade e privacidade

Os identificadores internos `YuriMusic` são mantidos onde atualizadores, atalhos ou bibliotecas antigas dependem deles. Os arquivos da prévia Windows continuam sendo usados com fallback para a biblioteca estável. Credenciais YouTube ficam protegidas pelo DPAPI no Windows; importações Android usam Android Keystore/AES-GCM e a sessão da WebView fica no armazenamento privado do sistema. Cookies não retornam à interface nem são registrados em logs.

## Compilar

Go 1.27.3; para Windows, .NET Framework 4.x e o NuGet oficial Microsoft.Web.WebView2 1.0.4314.35; para Android, JDK 21, Gradle 8.9 e Android SDK 35. `build.ps1` compila o cliente e Windows; `build.ps1 -Android` compila o cliente e APK. Passe `-Go` se necessário e `-WebViewPackage` apontando à pasta do pacote NuGet extraído. O pacote Windows precisa do WebView2 Runtime instalado no sistema. O projeto Android não precisa mais de Python.

Testes: `go test ./youtube -count=1` em `shared`, `node --test windows/tests/*.test.mjs`; o teste C# `YouTubeSecurityTests.cs` verifica proteção de sessão, origem e logout. Os testes de parser/conta do Meiro usam servidores de teste locais; não substituem validação com conta real.

## Limites verificados

Esta é uma adaptação para a arquitetura existente do Nocturne, não uma compilação da UI nativa MyGo. Não se declara paridade visual ou funcional completa. Last.fm, seleção de canais/contas e sincronização do progresso de podcasts ainda não foram portados à interface. Escritas de conta dependem de uma sessão válida e foram cobertas pelos testes do cliente; não foram realizadas numa conta real. Não houve aparelho Android conectado para validar teclado, login Google e reprodução em segundo plano. Veja `VALIDACAO.md` para evidências e pendências.

## Licença

GNU GPL versão 3; sem garantia. O código-fonte correspondente acompanha a distribuição. Créditos e licenças separadas em `THIRD-PARTY-NOTICES.md` e `third_party/`. A fonte Google Sans usa OFL; a fonte Minecraft fornecida ao projeto mantém sua licença separada. A mascote é original e não utiliza a imagem de banco com marca-d’água.

## Correções 0.11.1

Álbuns preservam o endpoint original e cabeçalhos responsivos, com capa/título de fallback. Espectro visível novamente no desktop, com opção arco-íris e reflexo. Home junto à busca, mascote maior, animações opcionais e preferência Minecraft removida. Slider desmuta ao ajustar; comandos de volume Spotify são serializados e agrupados. Login sai da janela controlada, recusada pelo Google, para o navegador normal; importação explícita permanece necessária.

## Instalação Windows · 0.12.0

Use Nocturne-Setup-0.12.0.exe. Instala por usuário em %LOCALAPPDATA%/Programs/Nocturne, sem exigir administrador, cria entrada no menu Iniciar e em Aplicativos instalados, oferece atalho na área de trabalho e instala o WebView2 oficial Microsoft caso necessário (internet). Feche o app, inclusive a bandeja, antes de instalar ou desinstalar. A desinstalação preserva biblioteca, preferências, downloads e arquivos não pertencentes ao pacote. A edição ZIP portátil continua disponível.

O repositório foi renomeado para https://github.com/yuri434/nocturne. Por causa da troca de endereço, instalações antigas podem precisar do setup uma vez; a versão nova usa o endereço Nocturne no atualizador. Removidas referências ao provedor nas mensagens de carregamento e adicionado ícone no botão lateral de aparência/configurações.

Compilar setup: instale ou extraia NSIS 3.12 oficial; compile o Windows com build.ps1, depois execute installer/build-installer.ps1 com -Payload, -Compiler e -Bootstrapper. O bootstrapper WebView2 vem de https://go.microsoft.com/fwlink/p/?LinkId=2124703 e o script exige assinatura Microsoft válida. O setup Nocturne não tem assinatura comercial de editor.
