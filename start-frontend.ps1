# Script pour démarrer le frontend SopraHR
Write-Host "🌐 Démarrage du frontend SopraHR..." -ForegroundColor Green

# Vérifier le dossier frontend
if (-not (Test-Path "avance-salaire-frontend")) {
    Write-Host "❌ Erreur: Dossier frontend manquant" -ForegroundColor Red
    Write-Host "📁 Dossier actuel: $PWD" -ForegroundColor Yellow
    exit 1
}

# Aller dans le dossier frontend
Set-Location "avance-salaire-frontend"

# Démarrer le frontend
Write-Host "📡 Démarrage d'Angular..." -ForegroundColor Yellow
Write-Host "⏳ Veuillez attendre que le frontend démarre..." -ForegroundColor Cyan

# Utiliser npm start
npm start 