# Script pour démarrer le backend SopraHR
Write-Host "🚀 Démarrage du backend SopraHR..." -ForegroundColor Green

# Vérifier le dossier backend
if (-not (Test-Path "avance-salaire-backend")) {
    Write-Host "❌ Erreur: Dossier backend manquant" -ForegroundColor Red
    Write-Host "📁 Dossier actuel: $PWD" -ForegroundColor Yellow
    exit 1
}

# Aller dans le dossier backend
Set-Location "avance-salaire-backend"

# Démarrer le backend
Write-Host "📡 Démarrage de Spring Boot..." -ForegroundColor Yellow
Write-Host "⏳ Veuillez attendre que le backend démarre..." -ForegroundColor Cyan

# Utiliser mvnw.cmd pour Windows
.\mvnw.cmd spring-boot:run 