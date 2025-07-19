# MIFTAH Hub - SPARTA Phase 1

🛡️ **Hub de cybersécurité avancé** - Interface de commande et contrôle pour les opérations SPARTA.

## 📋 Vue d'ensemble

MIFTAH est le centre névralgique du projet SPARTA, offrant une interface unifiée pour la gestion des modules de cybersécurité :

- **OMEGA** : Reconnaissance et intelligence
- **ATLAS** : Cartographie réseau  
- **PROLITAGE** : Analyse avancée

## 🏗️ Architecture

```
MIFTAH/
├── static/               # Ressources front-end
│   ├── css/
│   ├── js/
│   └── img/
├── templates/            # Templates HTML
│   ├── login.html
│   ├── dashboard.html
│   └── error.html
├── core/                 # Noyau système
│   ├── crypto/          # Chiffrement
│   ├── database/        # Base de données
│   ├── sockets/         # Communications
│   ├── modules/         # Modules SPARTA
│   │   ├── omega/
│   │   ├── atlas/
│   │   └── prolitage/
│   └── security/        # Sécurité
├── agents/              # Gestion agents
├── logs/                # Journaux cryptés
├── config.py            # Configuration
├── app.py               # Application principale
└── requirements.txt     # Dépendances
```

## 🚀 Installation

### Prérequis
- Python 3.12+
- pip
- virtualenv

### Configuration environnement

1. **Cloner le projet**
```bash
git clone <repository>
cd MIFTAH
```

2. **Créer environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. **Installer dépendances**
```bash
pip install -r requirements.txt
```

4. **Configuration automatique**
```bash
python setup_env.py
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` :

```bash
# Sécurité
MIFTAH_SECRET_KEY=your-secret-key-here
MIFTAH_ENCRYPTION_KEY=your-encryption-key
MIFTAH_DB_KEY=your-database-key

# Application
MIFTAH_DEBUG=False
MIFTAH_HOST=127.0.0.1
MIFTAH_PORT=5000
MIFTAH_LOG_LEVEL=INFO
```

### Base de données

La base de données SQLCipher est automatiquement créée au premier lancement.

## 🏃‍♂️ Lancement

```bash
python app.py
```

Interface accessible sur : `http://127.0.0.1:5000`

### Identifiants par défaut
- **Utilisateur** : `admin`
- **Mot de passe** : `sparta2025`

⚠️ **Changez ces identifiants en production !**

## 📡 API

### Endpoints principaux

- `GET /api/status` - Statut système
- `GET /api/agents` - Liste des agents
- `POST /login` - Authentification
- `WebSocket /socket.io` - Communications temps réel

## 🔒 Sécurité

### Fonctionnalités implémentées

- ✅ Chiffrement des communications
- ✅ Sessions sécurisées
- ✅ Headers de sécurité
- ✅ Logs cryptés
- ✅ Authentification renforcée
- ✅ Protection CSRF

### Bonnes pratiques

1. **Changez toutes les clés par défaut**
2. **Utilisez HTTPS en production**
3. **Configurez un firewall**
4. **Surveillez les logs**
5. **Mettez à jour régulièrement**

## 🧩 Modules

### OMEGA - Reconnaissance
Module de reconnaissance et collecte d'intelligence.

### ATLAS - Cartographie  
Cartographie réseau et découverte d'infrastructure.

### PROLITAGE - Analyse
Analyse avancée et corrélation de données.

## 📊 Monitoring

### Métriques surveillées
- CPU, Mémoire, Réseau
- Agents actifs
- Logs système
- Statut modules

### Alertes
- Connexions suspectes
- Erreurs système
- Agents déconnectés
- Surcharge ressources

## 🔧 Développement

### Structure du code
- `app.py` : Application Flask principale
- `config.py` : Configuration centralisée
- `core/` : Modules métier
- `static/` : Ressources web
- `templates/` : Templates Jinja2

### Tests
```bash
python -m pytest tests/
```

### Contribution
1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Créer une Pull Request

## 📝 Changelog

### v1.0.0 - Phase 1
- ✅ Interface web responsive
- ✅ Authentification sécurisée
- ✅ Modules OMEGA/ATLAS/PROLITAGE
- ✅ Gestion agents
- ✅ Logs cryptés
- ✅ API REST + WebSockets

## 🆘 Support

### Logs
Les logs sont disponibles dans `logs/miftah.log`

### Debug
Activer le mode debug : `MIFTAH_DEBUG=True`

### Contact
- 📧 Email : support@sparta-security.com
- 🐛 Issues : GitHub Issues
- 📖 Wiki : Documentation complète

## ⚖️ Licence

**Usage strictement autorisé pour la sécurité défensive.**

---

🛡️ **SPARTA Security Framework** - *Protecting Digital Assets*