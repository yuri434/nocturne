# Noctune — prévia Spotify 0.9.0

Esta prévia mantém o design, as cabeças e os temas do Yuri Music, adicionando Spotify como fonte selecionável. A reprodução usa o Web Player oficial numa janela/WebView separada. Login e cookies ficam nessa vista; o adaptador não devolve senhas ou tokens à interface. Não há bloqueio de anúncios nem alteração de DRM. Conta e serviço determinam disponibilidade, anúncios e qualidade.

## Testar

Windows: feche o Yuri Music, extraia o ZIP completo e abra `Noctune.exe`. Vá a Configurações → Fonte de música → Spotify → Conectar Spotify. Entre na janela oficial e feche essa janela para voltar ao Noctune; ela permanece como motor de reprodução. Use Verificar conexão e depois busque uma música.

Android: o APK da prévia usa o pacote separado `com.yuri.music.noctune.preview`, permitindo manter o app estável instalado. O design e controles são os mesmos, com login em uma vista separada. Não foi testado em aparelho físico.

## Voltar ao modo anterior

Selecione YouTube Music nas configurações. No Windows, a biblioteca e a sessão da prévia usam arquivos e chaves locais separados; a biblioteca estável 0.8.0 não é substituída. O cache e downloads Windows existentes continuam acessíveis. Sincronização automática usa uma configuração separada. No Android, a prévia tem armazenamento independente; exporte/importе um backup se quiser copiar sua coleção local.

## Limites desta prévia

Busca, álbum e artista foram testados ao vivo sem conta: 25 resultados de busca, 10 faixas de álbum e 10 do artista, além da renderização na interface Noctune. 29 testes JS passaram, incluindo IDs mistos e retorno ao player antigo; Windows e APK compilados e assinatura validada. Reprodução autenticada e controles de áudio ainda aguardam teste com a conta do usuário. Não anunciar como substituição estável antes dessa validação.

Equalizador, espectro e downloads da integração anterior permanecem no modo YouTube Music. O áudio protegido do Spotify não passa pelo analisador Web Audio. Curtidas Spotify são carregadas separadamente; seguir artistas e sincronização de biblioteca Spotify completa não fazem parte desta etapa. APIs internas e hashes de consulta podem mudar e exigir manutenção.

## Código e compilação

`windows/` e `android/` contêm a fonte completa da prévia. Use os mesmos requisitos de `docs/BUILD-WINDOWS.md` na raiz, compilando os C# desta pasta com `/main:Desktop` e `/win32icon`, incluindo SpotifyHost.cs e WindowChrome.cs. Compile tools/NoctuneLauncher.cs à parte como Noctune.exe; o motor de janela continua com o nome interno YuriMusic-YouTube.exe para compatibilidade. Android usa o projeto Gradle desta pasta. Os nomes internos e identificadores originais de dados são preservados de propósito.

Referência de interoperabilidade consultada: https://github.com/kota-zo/myspoti — nomes de serviços e operações observados no código público do Web Player. O adaptador JavaScript/hosts desta prévia foi escrito para a arquitetura Noctune; não inclui os componentes, bloqueador ou extensões Myspoti.
