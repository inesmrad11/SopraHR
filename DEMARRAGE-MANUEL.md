# 🚀 Démarrage manuel des serveurs SopraHR

## 📋 Instructions étape par étape

### 1. Démarrer le Backend

**Ouvrez un nouveau terminal PowerShell et exécutez :**

```powershell
cd C:\Users\INES\OneDrive\Bureau\sopraHR\avance-salaire-backend
.\mvnw.cmd spring-boot:run
```

**Attendez que vous voyiez :**
```
Started Application in X.XXX seconds
```

### 2. Démarrer le Frontend

**Ouvrez un autre terminal PowerShell et exécutez :**

```powershell
cd C:\Users\INES\OneDrive\Bureau\sopraHR\avance-salaire-frontend
npm start
```

**Attendez que vous voyiez :**
```
Compiled successfully
```

### 3. Tester les serveurs

**Backend :**
- URL : http://localhost:8080
- Test : http://localhost:8080/api/notifications/health

**Frontend :**
- URL : http://localhost:4200

## 🔧 Résolution des problèmes

### Erreur "mvnw.cmd not found"
```powershell
# Vérifiez que vous êtes dans le bon dossier
ls
# Vous devriez voir mvnw.cmd dans la liste
```

### Erreur "npm start not found"
```powershell
# Vérifiez que vous êtes dans le bon dossier
ls
# Vous devriez voir package.json dans la liste
```

### Erreur 404 sur /api/notifications
- Vérifiez que le backend est démarré
- Testez : http://localhost:8080/api/notifications/health
- Vérifiez les logs du backend

## 📱 URLs importantes

- **Application** : http://localhost:4200
- **Backend** : http://localhost:8080
- **Test Backend** : http://localhost:8080/api/notifications/health
- **API Notifications** : http://localhost:8080/api/notifications/test

## ✅ Vérification

1. **Backend démarré** : http://localhost:8080/api/notifications/health retourne "Backend is running!"
2. **Frontend démarré** : http://localhost:4200 affiche l'application SopraHR
3. **Notifications** : Les icônes Ant Design fonctionnent dans la messagerie RH 