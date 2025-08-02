# 🚀 Guide de démarrage des serveurs SopraHR

## 📋 Prérequis

- **Java 17+** installé
- **Node.js 18+** installé
- **npm** installé
- **Maven** (optionnel, le wrapper est inclus)

## 🎯 Méthodes de démarrage

### Option 1: Script automatique (Recommandé)

#### PowerShell (Windows)
```powershell
# Depuis le dossier racine du projet
.\start-servers.ps1
```

#### Batch (Windows)
```cmd
# Depuis le dossier racine du projet
start-servers.bat
```

### Option 2: Démarrage manuel

#### Terminal 1 - Backend
```powershell
cd avance-salaire-backend
.\mvnw.cmd spring-boot:run
```

#### Terminal 2 - Frontend (après 10-15 secondes)
```powershell
cd avance-salaire-frontend
npm start
```

## 🔍 Vérification du démarrage

### Backend (Spring Boot)
- **URL**: http://localhost:8080
- **Indicateur de succès**: `Started Application in X.XXX seconds`
- **Test API**: http://localhost:8080/api/notifications/test

### Frontend (Angular)
- **URL**: http://localhost:4200
- **Indicateur de succès**: `Compiled successfully`
- **Interface**: Application SopraHR

## 🛠️ Résolution des problèmes

### Erreur "mvn not found"
```powershell
# Utilisez le wrapper Maven inclus
.\mvnw.cmd spring-boot:run
```

### Erreur "npm start not found"
```powershell
# Vérifiez que vous êtes dans le bon dossier
cd avance-salaire-frontend
npm install  # Si nécessaire
npm start
```

### Erreur 404 sur /api/notifications
- Vérifiez que le backend est démarré
- Testez l'endpoint: http://localhost:8080/api/notifications/test
- Vérifiez les logs du backend

### Erreur de port déjà utilisé
```powershell
# Backend (port 8080)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Frontend (port 4200)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

## 📱 URLs importantes

- **Application**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **Test Notifications**: http://localhost:8080/api/notifications/test
- **Swagger API**: http://localhost:8080/swagger-ui.html

## 🔧 Configuration

### Variables d'environnement
- Copiez `env.example` vers `.env`
- Configurez les variables selon votre environnement

### Base de données
- La base de données H2 est automatiquement créée
- Fichier: `avance-salaire-backend/data/testdb.mv.db`

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans les terminaux
2. Testez les endpoints individuellement
3. Redémarrez les serveurs
4. Vérifiez les prérequis 