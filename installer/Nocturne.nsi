Unicode True
!include MUI2.nsh
!include LogicLib.nsh
!include FileFunc.nsh
!include x64.nsh
!include WinVer.nsh
!ifndef PAYLOAD
 !error "Informe /DPAYLOAD com a pasta Windows pronta"
!endif
!ifndef WEBVIEW
 !error "Informe /DWEBVIEW com o bootstrapper oficial Microsoft"
!endif
!ifndef OUTFILE
 !define OUTFILE "Nocturne-Setup-0.12.2.exe"
!endif
Name "Nocturne"
OutFile "${OUTFILE}"
InstallDir "$LOCALAPPDATA\Programs\Nocturne"
InstallDirRegKey HKCU "Software\Nocturne" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetDatablockOptimize on
VIProductVersion "0.12.2.0"
VIAddVersionKey "ProductName" "Nocturne"
VIAddVersionKey "FileDescription" "Instalador do Nocturne"
VIAddVersionKey "FileVersion" "0.12.2"
VIAddVersionKey "ProductVersion" "0.12.2"
VIAddVersionKey "LegalCopyright" "Nocturne contributors · GPLv3"
Icon "${PAYLOAD}\YuriMusic.ico"
UninstallIcon "${PAYLOAD}\YuriMusic.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Instalar Nocturne"
!define MUI_WELCOMEPAGE_TEXT "Música do seu jeito.$\r$\n$\r$\nInstala o Nocturne neste usuário do Windows, com atalhos e desinstalação.$\r$\nSua biblioteca e preferências existentes serão preservadas.$\r$\n$\r$\nSe necessário, o WebView2 será instalado a partir do pacote oficial Microsoft (requer internet)."
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\Nocturne.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Abrir Nocturne"
!define MUI_FINISHPAGE_RUN_NOTCHECKED
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"
Var TestMode
Var Params
Function .onInit
 ${GetParameters} $Params
 ClearErrors
 ${GetOptions} $Params "/TESTMODE" $0
 StrCpy $TestMode "0"
 ${IfNot} ${Errors}
  StrCpy $TestMode "1"
 ${EndIf}
 ${IfNot} ${RunningX64}
  MessageBox MB_ICONSTOP "O Nocturne precisa do Windows de 64 bits."
  Abort
 ${EndIf}
 ${IfNot} ${AtLeastWin10}
  MessageBox MB_ICONSTOP "O Nocturne precisa do Windows 10 ou mais recente."
  Abort
 ${EndIf}
 ${If} $TestMode != "1"
  System::Call 'kernel32::OpenMutexW(i 0x100000, i 0, w "Local\YuriMusicYoutube05") p.r0'
  ${If} $0 != 0
   System::Call 'kernel32::CloseHandle(p r0)'
   MessageBox MB_ICONEXCLAMATION "Feche o Nocturne, inclusive o ícone perto do relógio, antes de instalar."
   Abort
  ${EndIf}
 ${EndIf}
FunctionEnd
Section "Nocturne (obrigatório)" Main
 SectionIn RO
 SetShellVarContext current
 SetOutPath "$INSTDIR"
 !include "payload-files.nsh"
 ExecWait '"$INSTDIR\InstallSupport.exe" --runtime' $0
 ${If} $0 != 0
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /oname=WebView2Setup.exe "${WEBVIEW}"
  DetailPrint "Instalando o componente oficial Microsoft WebView2..."
  ExecWait '"$PLUGINSDIR\WebView2Setup.exe" /silent /install' $0
  ExecWait '"$INSTDIR\InstallSupport.exe" --runtime' $0
  ${If} $0 != 0
   MessageBox MB_ICONSTOP "Não foi possível instalar o WebView2. Conecte à internet e execute o setup novamente. Seus dados foram preservados."
   SetErrorLevel 10
   Abort
  ${EndIf}
 ${EndIf}
 SetOutPath "$INSTDIR"
 WriteUninstaller "$INSTDIR\Uninstall.exe"
 ${If} $TestMode == "1"
  FileOpen $0 "$INSTDIR\installer-test.flag" w
  FileClose $0
 ${Else}
  CreateShortCut "$SMPROGRAMS\Nocturne.lnk" "$INSTDIR\YuriMusic-YouTube.exe" "" "$INSTDIR\YuriMusic.ico"
  ExecWait '"$INSTDIR\InstallSupport.exe" --taglink "$SMPROGRAMS\Nocturne.lnk"' $0
  WriteRegStr HKCU "Software\Nocturne" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "DisplayName" "Nocturne"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "DisplayVersion" "0.12.2"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "Publisher" "Nocturne"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "DisplayIcon" "$INSTDIR\YuriMusic.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "URLInfoAbout" "https://github.com/yuri434/nocturne"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "QuietUninstallString" '$\"$INSTDIR\Uninstall.exe$\" /S'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne" "NoRepair" 1
 ${EndIf}
SectionEnd
Section "Atalho na área de trabalho" DesktopShortcut
 ${If} $TestMode != "1"
  CreateShortCut "$DESKTOP\Nocturne.lnk" "$INSTDIR\YuriMusic-YouTube.exe" "" "$INSTDIR\YuriMusic.ico"
  ExecWait '"$INSTDIR\InstallSupport.exe" --taglink "$DESKTOP\Nocturne.lnk"' $0
 ${EndIf}
SectionEnd
Function un.onInit
 SetShellVarContext current
 IfFileExists "$INSTDIR\installer-test.flag" done
 System::Call 'kernel32::OpenMutexW(i 0x100000, i 0, w "Local\YuriMusicYoutube05") p.r0'
 ${If} $0 != 0
  System::Call 'kernel32::CloseHandle(p r0)'
  MessageBox MB_ICONEXCLAMATION "Feche o Nocturne antes de desinstalar."
  Abort
 ${EndIf}
 done:
FunctionEnd
Section "Uninstall"
 IfFileExists "$INSTDIR\installer-test.flag" skipRegistration
 Delete "$SMPROGRAMS\Nocturne.lnk"
 Delete "$DESKTOP\Nocturne.lnk"
 DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Nocturne"
 DeleteRegKey HKCU "Software\Nocturne"
 skipRegistration:
 !include "payload-remove.nsh"
 Delete "$INSTDIR\installer-test.flag"
 Delete "$INSTDIR\Uninstall.exe"
 RMDir "$INSTDIR"
 ; Never recursively remove the install folder or the user's music/preferences.
SectionEnd
