@echo off
cd /d c:\Users\wael\Desktop\Quran\backend
echo Starting sequential audio localization >> storage\logs\localize-all.log

for %%R in (4 5 6 7 8 9 10 11 12 13 15 16) do (
    echo === Reciter %%R started %date% %time% >> storage\logs\localize-all.log
    php artisan quran:localize-audio --reciter_id=%%R >> storage\logs\localize-reciter-%%R.log 2>&1
    echo === Reciter %%R done %date% %time% >> storage\logs\localize-all.log
)

echo ALL DONE %date% %time% >> storage\logs\localize-all.log
