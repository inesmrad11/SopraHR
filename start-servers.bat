@echo off
echo 🚀 Démarrage des serveurs SopraHR...
echo.

REM Vérifier que nous sommes dans le bon dossier
if not exist "avance-salaire-backend" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le dossier racine du projet
    echo 📁 Dossier actuel: %CD%
    pause
    exit /b 1
)

if not exist "avance-salaire-frontend" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le dossier racine du projet
    echo 📁 Dossier actuel: %CD%
    pause
    exit /b 1
)

echo 📡 Démarrage du backend Spring Boot...
echo ⏳ Veuillez attendre que le backend soit complètement démarré...
echo.

REM Démarrer le backend dans une nouvelle fenêtre
start "Backend SopraHR" cmd /k "cd /d %CD%\avance-salaire-backend && mvnw.cmd spring-boot:run"

REM Attendre que le backend démarre
echo ⏰ Attente de 15 secondes pour que le backend démarre...
timeout /t 15 /nobreak >nul

echo 🌐 Démarrage du frontend Angular...
echo.

REM Démarrer le frontend dans une nouvelle fenêtre
start "Frontend SopraHR" cmd /k "cd /d %CD%\avance-salaire-frontend && npm start"

echo ✅ Les serveurs sont en cours de démarrage...
echo 📱 Backend: http://localhost:8080
echo 🌐 Frontend: http://localhost:4200
echo 🔔 Test API: http://localhost:8080/api/notifications/test
echo.
echo 💡 Instructions:
echo    1. Attendez que le backend affiche 'Started Application'
echo    2. Attendez que le frontend affiche 'Compiled successfully'
echo    3. Ouvrez http://localhost:4200 dans votre navigateur
echo    4. Testez l'API: http://localhost:8080/api/notifications/test
echo.
pause 