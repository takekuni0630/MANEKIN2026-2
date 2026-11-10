@echo off
chcp 65001 > nul
echo ========================================================
echo  MANEKIN FASHION - バックエンド API & MySQL サーバー起動
echo ========================================================
echo.
echo ※ 事前に XAMPP Control Panel で「MySQL」がStartになっていることをご確認ください。
echo 接続URL: http://127.0.0.1:8080
echo.
cd /d "%~dp0"
python app.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] サーバーの起動に失敗しました。必要なライブラリがインストールされているか確認してください。
    echo pip install flask flask-cors pymysql
)
pause
