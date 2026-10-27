@echo off
chcp 65001 >nul
color 0D
title Atualizar Catalogo - Cantinho da Lanna

echo.
echo ============================================
echo    ATUALIZAR CATALOGO - CANTINHO DA LANNA
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando alteracoes...
git status --short
echo.

echo [2/4] Adicionando arquivos...
git add .
if %errorlevel% neq 0 (
    color 0C
    echo ERRO ao adicionar arquivos!
    pause
    exit /b 1
)
echo OK!
echo.

echo [3/4] Criando commit...
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATA=%%a-%%b-%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA=%%a:%%b
git commit -m "Atualizacao - %DATA% %HORA%"
echo.

echo [4/4] Enviando para o GitHub...
git push
if %errorlevel% neq 0 (
    echo.
    color 0E
    echo ============================================
    echo  AVISO: O GitHub tem alteracoes mais recentes
    echo  (provavelmente o produtos.json foi atualizado)
    echo.
    echo  Tentando sincronizar...
    echo ============================================
    echo.
    git pull origin main --no-edit
    git push
)

echo.
color 0A
echo ============================================
echo           TUDO PRONTO! SUCESSO!
echo ============================================
echo.
echo  Site vai atualizar em 1-2 minutos:
echo  https://catalogo-cantinho-da-lanna-sigma.vercel.app
echo.
echo  Pressione qualquer tecla para sair...
pause >nul