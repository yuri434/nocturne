# Validação · Nocturne 0.11.0

- Cliente original Meiro: suíte Go passou com servidores HTTP locais. Nenhuma credencial real usada nos testes.
- Regressões Nocturne: 29 testes JavaScript de biblioteca, temas, áudio, sessão, rádio e compatibilidade Spotify passaram.
- Windows nativo: busca real retornou 20 resultados; o áudio real avançou; menu de contexto e adicionar à fila passaram. A captura `Nocturne-PC.png` mostra a interface compartilhada executada no WebView2.
- Segurança Windows: DPAPI, rejeição de origens não autorizadas e exclusão da sessão passaram usando apenas um valor fictício.
- Tela de celular: viewport 390×844, busca real e foco HTML, navegação inferior e revisão de cortes. Isso não é teste em aparelho Android nem comprovação do teclado Google.
- Android: compilação Gradle/Java concluída; assinatura comparada aos APKs anteriores. Sem dispositivo conectado no ADB, portanto login Google, teclado real, notificações e reprodução em segundo plano ainda precisam ser validados no aparelho.
- Conta YouTube: endpoints e parâmetros são os do cliente Meiro reaproveitado; parser, autenticação e escritas são cobertos pelos testes originais. Não foram feitas alterações numa conta real.

## Pendências explícitas

Não há paridade completa com Meiro. Last.fm, seletor de canais/contas e a sincronização remota de progresso de podcasts ainda não foram portados à interface. A UI continua na arquitetura Windows WebView2/Android WebView do Nocturne, adaptada às telas Material 3 do Meiro, em vez da UI nativa MyGo. Não há promessa de consumo de memória igual ao Meiro. O Google pode restringir autenticação embarcada; o aplicativo mostra o erro, oferece o navegador e a importação nativa de sessão própria, sem bypass.
