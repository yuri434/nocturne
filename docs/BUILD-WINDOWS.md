# Compilar no Windows

Requisitos: .NET Framework 4.x (compilador C# x64), Python 3.12, PyInstaller, pacote NuGet Microsoft.Web.WebView2 1.0.4314.35 e WebView2 Runtime.

1. Instale `windows/src/requirements.txt` no Python e instale PyInstaller.
2. Execute `python -m PyInstaller --noconfirm --onedir --name YuriAudio windows/src/backend.py`.
3. Crie uma pasta de distribuição, copie `windows/web/`, o conteúdo de `dist/YuriAudio/` para uma subpasta `backend/`, `windows/YuriMusic.ico` e `windows/YuriMusic-YouTube.exe.config`.
4. Compile os arquivos C# de `windows/src/` com o compilador x64 de .NET Framework, usando `/target:winexe /platform:x64 /main:Desktop /win32icon:windows/YuriMusic.ico` e saída `YuriMusic-YouTube.exe` na pasta de distribuição.
5. Referencie `System.IO.Compression.dll`, `System.IO.Compression.FileSystem.dll`, `System.Net.Http.dll`, `System.Web.Extensions.dll`, `System.Drawing.dll`, `System.Windows.Forms.dll` e as duas DLLs `lib/net462/Microsoft.Web.WebView2.Core.dll` e `Microsoft.Web.WebView2.WinForms.dll` do pacote NuGet.
6. Copie essas duas DLLs e `runtimes/win-x64/native/WebView2Loader.dll` do pacote NuGet para a mesma pasta do executável.

A distribuição oficial inclui os avisos dos componentes em `licenses/`. Preserve esses avisos ao empacotar.


7. Compile também `windows/src/UpdaterMain.cs` como `/target:winexe /platform:x64 /main:UpdaterMain`, referenciando `System.Windows.Forms.dll`, com saída `YuriMusicUpdater.exe` na distribuição. Esse helper é obrigatório para atualizar.

O parâmetro `/win32icon` é obrigatório: o Windows usa o recurso do executável nos atalhos fixados. Mantenha também o AppUserModelID estável `YuriMusic.Desktop`.
