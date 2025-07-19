"""
MIFTAH - Configuration principale
Paramètres sensibles et configuration système
"""

import os
from pathlib import Path

# Chemins de base
BASE_DIR = Path(__file__).parent.absolute()
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
CORE_DIR = BASE_DIR / "core"
AGENTS_DIR = BASE_DIR / "agents"
LOGS_DIR = BASE_DIR / "logs"

# Configuration Flask
class Config:
    """Configuration de base Flask"""
    SECRET_KEY = os.environ.get('MIFTAH_SECRET_KEY') or 'dev-key-change-in-production'
    DEBUG = os.environ.get('MIFTAH_DEBUG', 'False').lower() == 'true'
    HOST = os.environ.get('MIFTAH_HOST', '127.0.0.1')
    PORT = int(os.environ.get('MIFTAH_PORT', 5000))

# Configuration Sécurité
class SecurityConfig:
    """Paramètres de sécurité"""
    # Chiffrement
    ENCRYPTION_KEY = os.environ.get('MIFTAH_ENCRYPTION_KEY')
    HASH_ROUNDS = 12
    
    # Sessions
    SESSION_TIMEOUT = 3600  # 1 heure
    MAX_LOGIN_ATTEMPTS = 3
    LOCKOUT_DURATION = 900  # 15 minutes
    
    # Headers sécurisés
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }

# Configuration Base de données
class DatabaseConfig:
    """Configuration SQLCipher"""
    DB_PATH = BASE_DIR / "core" / "database" / "miftah.db"
    DB_KEY = os.environ.get('MIFTAH_DB_KEY') or 'change-this-key'
    BACKUP_INTERVAL = 3600  # 1 heure
    
# Configuration Modules
class ModulesConfig:
    """Configuration des modules SPARTA"""
    
    # OMEGA - Reconnaissance
    OMEGA_CONFIG = {
        'enabled': True,
        'scan_timeout': 300,
        'max_threads': 10,
        'output_dir': LOGS_DIR / "omega"
    }
    
    # ATLAS - Cartographie
    ATLAS_CONFIG = {
        'enabled': True,
        'map_resolution': 'high',
        'cache_duration': 1800,
        'output_dir': LOGS_DIR / "atlas"
    }
    
    # PROLITAGE - Analyse
    PROLITAGE_CONFIG = {
        'enabled': True,
        'analysis_depth': 'deep',
        'report_format': 'json',
        'output_dir': LOGS_DIR / "prolitage"
    }

# Configuration Agents
class AgentsConfig:
    """Gestion des agents"""
    MAX_AGENTS = 50
    HEARTBEAT_INTERVAL = 30
    AGENT_TIMEOUT = 300
    ENCRYPTION_ENABLED = True

# Configuration Logs
class LogsConfig:
    """Configuration journalisation"""
    LOG_LEVEL = os.environ.get('MIFTAH_LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = LOGS_DIR / "miftah.log"
    MAX_LOG_SIZE = 10 * 1024 * 1024  # 10MB
    BACKUP_COUNT = 5
    ENCRYPT_LOGS = True

# Configuration SocketIO
class SocketConfig:
    """Configuration WebSockets"""
    ASYNC_MODE = 'eventlet'
    CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    PING_TIMEOUT = 60
    PING_INTERVAL = 25

# Validation environnement
def validate_environment():
    """Valide la configuration environnement"""
    errors = []
    
    # Vérification des répertoires
    required_dirs = [STATIC_DIR, TEMPLATES_DIR, CORE_DIR, AGENTS_DIR, LOGS_DIR]
    for directory in required_dirs:
        if not directory.exists():
            directory.mkdir(parents=True, exist_ok=True)
    
    # Vérification des clés sensibles
    if not SecurityConfig.ENCRYPTION_KEY:
        errors.append("MIFTAH_ENCRYPTION_KEY non définie")
    
    if Config.SECRET_KEY == 'dev-key-change-in-production' and not Config.DEBUG:
        errors.append("SECRET_KEY par défaut en production")
    
    return errors

# Export configuration
def get_config():
    """Retourne la configuration complète"""
    return {
        'app': Config,
        'security': SecurityConfig,
        'database': DatabaseConfig,
        'modules': ModulesConfig,
        'agents': AgentsConfig,
        'logs': LogsConfig,
        'socket': SocketConfig
    }