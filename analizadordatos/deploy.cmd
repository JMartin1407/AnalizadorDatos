@echo off

REM Deployment script for Next.js application

setlocal enabledelayedexpansion

REM Get the deploy source directory
if "%DEPLOYMENT_SOURCE%" == "" (
  set DEPLOYMENT_SOURCE=%~dp0
)

if "%DEPLOYMENT_TARGET%" == "" (
  set DEPLOYMENT_TARGET=%DEPLOYMENT_SOURCE%\..\wwwroot
)

REM Install dependencies
echo Installing dependencies...
call :ExecuteCmd npm install
if !ERRORLEVEL! neq 0 goto error

REM Build the application
echo Building Next.js application...
call :ExecuteCmd npm run build
if !ERRORLEVEL! neq 0 goto error

REM Create server.js for iisnode
echo Creating server.js...
(
  echo const { createServer } = require('http');
  echo const { parse } = require('url');
  echo const next = require('next');
  echo.
  echo const dev = process.env.NODE_ENV !== 'production';
  echo const app = next({ dev });
  echo const handle = app.getRequestHandler();
  echo.
  echo app.prepare().then(() => {
  echo   createServer((req, res) => {
  echo     const parsedUrl = parse(req.url, true);
  echo     handle(req, res, parsedUrl);
  echo   }).listen(process.env.PORT || 3000, (err) => {
  echo     if (err) throw err;
  echo     console.log('> Ready on port', process.env.PORT || 3000);
  echo   });
  echo });
) > server.js

echo Deployment completed successfully!
goto end

:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" neq "0" echo Error executing: %_CMD_%
exit /b %ERRORLEVEL%
endlocal

:error
echo An error occurred during deployment.
exit /b 1

:end
