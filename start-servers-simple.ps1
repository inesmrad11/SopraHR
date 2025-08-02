# Script simple pour démarrer les serveurs SopraHR
Write-Host "🚀 Démarrage des serveurs SopraHR..." -ForegroundColor Green
Write-Host ""

# Vérifier les dossiers
if (-not (Test-Path "avance-salaire-backend")) {
    Write-Host "❌ Erreur: Dossier backend manquant" -ForegroundColor Red
    Write-Host "📁 Dossier actuel: $PWD" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "avance-salaire-frontend")) {
    Write-Host "❌ Erreur: Dossier frontend manquant" -ForegroundColor Red
    Write-Host "📁 Dossier actuel: $PWD" -ForegroundColor Yellow
    exit 1
}

# Démarrer le backend
Write-Host "📡 Démarrage du backend Spring Boot..." -ForegroundColor Yellow
Write-Host "⏳ Veuillez attendre que le backend soit complètement démarré..." -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PWD "avance-salaire-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\mvnw.cmd spring-boot:run"

# Attendre
Write-Host "⏰ Attente de 15 secondes pour que le backend démarre..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Démarrer le frontend
Write-Host "🌐 Démarrage du frontend Angular..." -ForegroundColor Yellow
Write-Host ""

$frontendPath = Join-Path $PWD "avance-salaire-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"

Write-Host "✅ Les serveurs sont en cours de démarrage..." -ForegroundColor Green
Write-Host "📱 Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "🔔 Test API: http://localhost:8080/api/notifications/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Instructions:" -ForegroundColor White
Write-Host "   1. Attendez que le backend affiche 'Started Application'" -ForegroundColor Gray
Write-Host "   2. Attendez que le frontend affiche 'Compiled successfully'" -ForegroundColor Gray
Write-Host "   3. Ouvrez http://localhost:4200 dans votre navigateur" -ForegroundColor Gray
Write-Host "   4. Testez l'API: http://localhost:8080/api/notifications/test" -ForegroundColor Gray
Write-Host "" 