#!/usr/bin/env python3
"""
MIFTAH - Initialisation base de données
Script d'initialisation et de peuplement initial
"""

import os
import sys
from pathlib import Path
import logging

# Ajouter le répertoire parent au path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.database.models import DatabaseManager
from config import get_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialise la base de données avec les données par défaut"""
    
    config = get_config()
    db_config = config['database']
    
    # Créer le gestionnaire de base de données
    db = DatabaseManager(
        db_path=str(db_config.DB_PATH),
        db_key=db_config.DB_KEY
    )
    
    logger.info("🔐 Initialisation base de données SQLCipher")
    
    # Créer l'utilisateur administrateur par défaut
    if db.create_user(
        username='admin',
        password='sparta2025',
        email='admin@miftah.local',
        role='administrator'
    ):
        logger.info("✅ Utilisateur admin créé")
    else:
        logger.info("ℹ️  Utilisateur admin existe déjà")
    
    # Initialiser les modules SPARTA
    modules = [
        ('OMEGA', 'standby', '1.0.0'),
        ('ATLAS', 'standby', '1.0.0'),
        ('PROLITAGE', 'standby', '1.0.0'),
        ('MIFTAH', 'active', '1.0.0')
    ]
    
    for module_name, status, version in modules:
        config_data = {
            'enabled': True,
            'auto_start': False,
            'debug_mode': False
        }
        
        if db.update_module_status(
            module_name=module_name,
            status=status,
            version=version,
            config=config_data
        ):
            logger.info(f"✅ Module {module_name} initialisé")
    
    # Enregistrer des agents de test
    test_agents = [
        ('AGT-001', 'Phoenix', 'reconnaissance', 'Paris, FR', '192.168.1.100'),
        ('AGT-002', 'Cipher', 'infiltration', 'London, UK', '192.168.1.101'),
        ('AGT-003', 'Ghost', 'surveillance', 'Berlin, DE', '192.168.1.102')
    ]
    
    for agent_id, name, agent_type, location, ip in test_agents:
        if db.register_agent(agent_id, name, agent_type, location, ip):
            logger.info(f"✅ Agent {agent_id} enregistré")
    
    # Logs de sécurité initiaux
    initial_logs = [
        ('INFO', 'SYSTEM', 'startup', 'Système MIFTAH initialisé'),
        ('INFO', 'AUTH', 'user_created', 'Utilisateur administrateur créé'),
        ('INFO', 'MODULE', 'status_update', 'Modules SPARTA initialisés'),
        ('SUCCESS', 'DATABASE', 'init', 'Base de données SQLCipher configurée')
    ]
    
    for level, module, event_type, message in initial_logs:
        db.log_security_event(
            level=level,
            module=module,
            event_type=event_type,
            message=message,
            details={'source': 'init_script', 'version': '1.0.0'}
        )
    
    logger.info("✅ Base de données initialisée avec succès")
    
    # Test de chiffrement
    logger.info("🔐 Test du chiffrement...")
    test_data = "Données sensibles SPARTA"
    encrypted = db._encrypt_data(test_data)
    decrypted = db._decrypt_data(encrypted)
    
    if decrypted == test_data:
        logger.info("✅ Chiffrement/déchiffrement fonctionnel")
    else:
        logger.error("❌ Erreur chiffrement/déchiffrement")
    
    return db

def main():
    """Point d'entrée principal"""
    try:
        db = init_database()
        
        # Afficher quelques statistiques
        users = db.get_connection().execute("SELECT COUNT(*) as count FROM users").fetchone()
        agents = db.get_connection().execute("SELECT COUNT(*) as count FROM agents").fetchone()
        modules = db.get_connection().execute("SELECT COUNT(*) as count FROM module_status").fetchone()
        logs = db.get_connection().execute("SELECT COUNT(*) as count FROM security_logs").fetchone()
        
        print("\n📊 Statistiques base de données:")
        print(f"   👥 Utilisateurs: {users['count']}")
        print(f"   🤖 Agents: {agents['count']}")
        print(f"   📦 Modules: {modules['count']}")
        print(f"   📝 Logs: {logs['count']}")
        
        print(f"\n🛡️  Base de données MIFTAH prête!")
        print(f"   📁 Fichier: {db.db_path}")
        print(f"   🔐 Chiffrement: SQLCipher + AES-256")
        
    except Exception as e:
        logger.error(f"Erreur initialisation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()