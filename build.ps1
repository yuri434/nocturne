param([string]$Go='go',[string]$WebViewPackage='',[switch]$Android)
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
Push-Location "$root/shared"
try{$env:GOOS='js';$env:GOARCH='wasm'; & $Go build -trimpath -o ../windows/web/meiro.wasm ./wasm;if($LASTEXITCODE){throw 'Falha ao compilar o cliente compartilhado'}}finally{Remove-Item Env:GOOS,Env:GOARCH -ErrorAction SilentlyContinue;Pop-Location}
$goRoot=(& $Go env GOROOT)
Copy-Item "$goRoot/lib/wasm/wasm_exec.js" "$root/windows/web/wasm_exec.js" -Force
$font="$root/windows/web/fonts/GoogleSans.ttf"
if(!(Test-Path $font)){New-Item -ItemType Directory -Path (Split-Path $font) -Force|Out-Null;Invoke-WebRequest 'https://raw.githubusercontent.com/elianiva/meiro/67792edd6350b4fad54bbbea27a3b9acafe6c3bd/fonts/GoogleSans.ttf' -OutFile $font}
if($Android){Copy-Item "$root/windows/web/*" "$root/android/app/src/main/assets/" -Recurse -Force;& gradle -p "$root/android" assembleDebug;if($LASTEXITCODE){throw 'Falha no Android'};exit}
if(!$WebViewPackage){throw 'Informe -WebViewPackage com a pasta extraída do Microsoft.Web.WebView2 1.0.4314.35 (NuGet oficial).'}
$csc="$env:WINDIR/Microsoft.NET/Framework64/v4.0.30319/csc.exe"
$ref="$WebViewPackage/lib/net462"
$sources=Get-ChildItem "$root/windows/src/*.cs"|Select-Object -ExpandProperty FullName
& $csc /nologo /target:winexe /main:Desktop /platform:x64 "/out:$root/windows/YuriMusic-YouTube.exe" "/win32icon:$root/windows/YuriMusic.ico" /r:System.Security.dll /r:System.Net.Http.dll /r:System.Web.Extensions.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll "/r:$ref/Microsoft.Web.WebView2.Core.dll" "/r:$ref/Microsoft.Web.WebView2.WinForms.dll" $sources
if($LASTEXITCODE){throw 'Falha no Windows'}
& $csc /nologo /target:winexe /main:NocturneLauncher "/out:$root/windows/Nocturne.exe" "/win32icon:$root/windows/YuriMusic.ico" /r:System.Windows.Forms.dll (Join-Path $root 'tools\NocturneLauncher.cs')
if($LASTEXITCODE){throw 'Falha no launcher'}
& $csc /nologo /target:winexe /main:UpdaterMain "/out:$root/windows/YuriMusicUpdater.exe" /r:System.Windows.Forms.dll (Join-Path $root 'windows\src\UpdaterMain.cs')
if($LASTEXITCODE){throw 'Falha no atualizador'}
Copy-Item "$ref/Microsoft.Web.WebView2.Core.dll","$ref/Microsoft.Web.WebView2.WinForms.dll" "$root/windows/" -Force
Copy-Item "$WebViewPackage/runtimes/win-x64/native/WebView2Loader.dll" "$root/windows/" -Force
Write-Host 'Nocturne compilado. Abra windows/Nocturne.exe.'
