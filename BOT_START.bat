@echo off
Title Rosalina Bottings Started at %time%
color 0A
cls
echo Preventing Crashes.

:bot
cls
echo (%time%) Rosalina Bottings started.
start /wait node rosalina.js
echo (%time%) WARNING: Rosalina closed or crashed, restarting.
goto bot