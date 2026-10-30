param([string]$Version,[string]$Output)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
if(!$Version){$source=[IO.File]::ReadAllText((Join-Path $root 'windows\src\AppUpdates.cs'));$Version=[regex]::Match($source,'Current="(\d+\.\d+\.\d+)"').Groups[1].Value}
if($Version -notmatch '^\d+\.\d+\.\d+$'){throw 'Versão inválida'}
if(!$Output){$Output=Join-Path (Split-Path $root -Parent) "Nocturne-Windows-$Version.zip"}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$payload=(Resolve-Path (Join-Path $root 'windows')).Path
$stream=[IO.File]::Open($Output,[IO.FileMode]::Create)
$zip=New-Object IO.Compression.ZipArchive($stream,[IO.Compression.ZipArchiveMode]::Create)
try{foreach($file in (Get-ChildItem -LiteralPath $payload -File -Recurse)){
 $relative=$file.FullName.Substring($payload.Length+1)
 if($relative -match '(^|\\)(src|tests|heads)(\\|$)' -or $file.Name -match 'Test.*\.exe$|\.(zip|rar|apk)$'){continue}
 $entry="Nocturne-Windows-$Version/"+$relative.Replace('\','/')
 [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$entry,[IO.Compression.CompressionLevel]::Optimal)|Out-Null
}}finally{$zip.Dispose();$stream.Dispose()}
Write-Host "Pacote pronto: $Output"
