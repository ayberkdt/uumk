@echo off
rem UUMK sitesini yerel sunucuyla acar (animasyonlar file:// ile calismaz). Kapatmak icin pencerede Ctrl+C.
rem Node 22.13+ varsa tam site: hesap, giris, etkinlik kaydi (yerel deneme veritabani sunucu\veri\deneme.db;
rem e-postalar sunucu\posta-kutusu\ klasorune yazilir). Node yoksa yalniz sayfalar (PowerShell sunucusu).
setlocal
cd /d "%~dp0"

node -e "require('node:sqlite')" >nul 2>nul
if errorlevel 1 goto statik

if not exist "sunucu\veri\deneme.db" node araclar\ornek-veri.mjs
set PORT=8790
rem tarayici, sunucu dinlemeye baslayinca (yaklasik 2 sn sonra) acilir
start "" /b cmd /c "ping -n 3 127.0.0.1 >nul & start http://127.0.0.1:8790/"
node sunucu\sunucu.mjs --deneme
goto bitti

:statik
echo Node 22.13 veya ustu bulunamadi: site hesap ve kayit olmadan acilir.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0sunucu.ps1" -Port 8790 -OpenPath "/"

:bitti
if errorlevel 1 (
  echo.
  echo Sunucu beklenmedik sekilde durdu.
  pause
)
