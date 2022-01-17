@echo off

REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.ytdp.discord.presence" /ve /t REG_SZ /d "C:\ProgramData\YouTubeDiscordPresence Win64\main.json" /f
SET ORIGINAL_DIR=%cd%
cd C:\ProgramData
MOVE /Y "%ORIGINAL_DIR%" "C:\ProgramData"