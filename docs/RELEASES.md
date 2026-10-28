# Preparar uma atualização

Use versão numérica X.Y.Z, sem sufixo. Atualize `AppUpdates.Current` no Windows, `AppUpdates.CURRENT` no Android, `versionCode`/`versionName` no Gradle e a versão instalada em `index.html`.

Publique uma release estável com tag `vX.Y.Z` em `yuri434/yuri-music` contendo:

- `YuriMusic-Windows-X.Y.Z.zip`, com uma única pasta raiz `YuriMusic-Windows-X.Y.Z/` contendo executável, **YuriMusicUpdater.exe**, backend, WebView2, interface e avisos de terceiros.
- `YuriMusic-Android-X.Y.Z.apk`, com o mesmo applicationId e a mesma chave de assinatura das versões anteriores.
- `SHA256SUMS-X.Y.Z.txt`, com uma linha por arquivo no formato `hash_sha256  nome_do_arquivo`.

O atualizador não aceita uma release sem o pacote da sua plataforma e o arquivo de checksums. Os downloads são limitados a 300 MiB; ZIP descompactado a 1 GiB. Nunca inclua dados pessoais, keystores ou chaves na release ou no código.

A consulta usa `https://api.github.com/repos/yuri434/yuri-music/releases/latest`. Releases draft/prerelease não são instaladas. O usuário escolhe quando instalar. HTTPS e os checksums protegem o transporte e a integridade; a conta do repositório precisa continuar protegida. No Android, a assinatura instalada também é conferida.

Exemplo de checksum com PowerShell:

```powershell
Get-FileHash YuriMusic-Windows-X.Y.Z.zip,YuriMusic-Android-X.Y.Z.apk -Algorithm SHA256 | ForEach-Object { '{0}  {1}' -f $_.Hash.ToLower(),(Split-Path $_.Path -Leaf) } | Set-Content SHA256SUMS-X.Y.Z.txt -Encoding ascii
```

Windows guarda preparação/backup em `%LOCALAPPDATA%/YuriMusic/Updates/`. Um erro do helper é registrado em `result.txt` dentro da preparação correspondente. O estado do player continua em `%LOCALAPPDATA%/YuriMusic/YouTube05/`.
