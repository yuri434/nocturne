param([string]$Payload=(Join-Path $PSScriptRoot '..\windows'),[string]$Compiler='makensis.exe',[string]$Bootstrapper,[string]$Output=(Join-Path $PSScriptRoot '..\..\Nocturne-Setup-0.12.1.exe'))
$ErrorActionPreference='Stop'
$Payload=(Resolve-Path $Payload).Path
if(!$Bootstrapper){throw 'Informe -Bootstrapper com MicrosoftEdgeWebview2Setup.exe obtido em https://go.microsoft.com/fwlink/p/?LinkId=2124703'}
$Bootstrapper=(Resolve-Path $Bootstrapper).Path
$sig=Get-AuthenticodeSignature -LiteralPath $Bootstrapper
if($sig.Status -ne 'Valid' -or $sig.SignerCertificate.Subject -notmatch 'O=Microsoft Corporation'){throw 'O bootstrapper não possui assinatura Microsoft válida.'}
$csc="$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
& $csc /nologo /target:winexe /platform:x64 "/out:$Payload\InstallSupport.exe" "/r:$Payload\Microsoft.Web.WebView2.Core.dll" (Join-Path $PSScriptRoot 'InstallSupport.cs')
if($LASTEXITCODE){throw 'Falha no suporte de instalação'}
$files=Get-ChildItem -LiteralPath $Payload -File -Recurse | Where-Object {$_.Name -notmatch 'Test.*\.exe$|\.(rar|zip|apk)$' -and $_.FullName -notmatch '\\(src|tests|heads)\\'}
$install=[Collections.Generic.List[string]]::new();$remove=[Collections.Generic.List[string]]::new();$dirs=@{}
foreach($f in $files){$rel=$f.FullName.Substring($Payload.Length+1);$parent=Split-Path $rel;$install.Add('SetOutPath "$INSTDIR'+$(if($parent){'\'+$parent}else{''})+'"');$install.Add('File "${PAYLOAD}\'+$rel+'"');$remove.Add('Delete "$INSTDIR\'+$rel+'"');if($parent){$dirs[$parent]=$true}}
foreach($dir in ($dirs.Keys|Sort-Object Length -Descending)){$remove.Add('RMDir "$INSTDIR\'+$dir+'"')}
[IO.File]::WriteAllLines((Join-Path $PSScriptRoot 'payload-files.nsh'),$install,[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllLines((Join-Path $PSScriptRoot 'payload-remove.nsh'),$remove,[Text.UTF8Encoding]::new($false))
& $Compiler /V2 /INPUTCHARSET UTF8 "/DPAYLOAD=$Payload" "/DWEBVIEW=$Bootstrapper" "/DOUTFILE=$([IO.Path]::GetFullPath($Output))" (Join-Path $PSScriptRoot 'Nocturne.nsi')
if($LASTEXITCODE){throw 'Falha no setup'}
Write-Host "Setup criado: $Output"
