"""
MIFTAH - Modèles de base de données SQLCipher
Structures de données chiffrées pour le hub SPARTA
"""

import sqlite3
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
import json
import logging
from argon2 import PasswordHasher
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import base64

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Gestionnaire de base de données SQLCipher"""
    
    def __init__(self, db_path: str, db_key: str):
        self.db_path = Path(db_path)
        self.db_key = db_key
        self.ph = PasswordHasher()
        self.encryption_key = self._derive_encryption_key()
        
        # Créer le répertoire si nécessaire
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialiser la base de données
        self._init_database()
    
    def _derive_encryption_key(self) -> bytes:
        """Dérive une clé de chiffrement à partir de la clé DB"""
        import hashlib
        return hashlib.sha256(self.db_key.encode()).digest()
    
    def _encrypt_data(self, data: str) -> str:
        """Chiffre les données sensibles"""
        if not data:
            return data
        
        try:
            cipher = AES.new(self.encryption_key, AES.MODE_CBC)
            padded_data = pad(data.encode(), AES.block_size)
            encrypted = cipher.encrypt(padded_data)
            
            # Combiner IV + données chiffrées et encoder en base64
            result = base64.b64encode(cipher.iv + encrypted).decode()
            return result
        except Exception as e:
            logger.error(f"Erreur chiffrement: {e}")
            return data
    
    def _decrypt_data(self, encrypted_data: str) -> str:
        """Déchiffre les données"""
        if not encrypted_data:
            return encrypted_data
        
        try:
            data = base64.b64decode(encrypted_data.encode())
            iv = data[:16]  # AES block size
            encrypted = data[16:]
            
            cipher = AES.new(self.encryption_key, AES.MODE_CBC, iv)
            decrypted = unpad(cipher.decrypt(encrypted), AES.block_size)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Erreur déchiffrement: {e}")
            return encrypted_data
    
    def get_connection(self):
        """Obtient une connexion SQLCipher"""
        try:
            conn = sqlite3.connect(str(self.db_path))
            conn.row_factory = sqlite3.Row
            
            # Activer SQLCipher avec la clé
            conn.execute(f"PRAGMA key = '{self.db_key}'")
            conn.execute("PRAGMA cipher_compatibility = 4")
            
            return conn
        except Exception as e:
            logger.error(f"Erreur connexion DB: {e}")
            raise
    
    def _init_database(self):
        """Initialise les tables de la base de données"""
        with self.get_connection() as conn:
            # Table Utilisateurs
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    email TEXT,
                    role TEXT DEFAULT 'operator',
                    is_active BOOLEAN DEFAULT 1,
                    last_login TIMESTAMP,
                    failed_attempts INTEGER DEFAULT 0,
                    locked_until TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Table Agents
            conn.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT DEFAULT 'offline',
                    location TEXT,
                    ip_address TEXT,
                    last_seen TIMESTAMP,
                    heartbeat_interval INTEGER DEFAULT 30,
                    config TEXT,
                    encrypted_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Table Logs Sécurité
            conn.execute("""
                CREATE TABLE IF NOT EXISTS security_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    level TEXT NOT NULL,
                    module TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    encrypted_details TEXT,
                    user_id INTEGER,
                    agent_id TEXT,
                    ip_address TEXT,
                    session_id TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Table Status Modules
            conn.execute("""
                CREATE TABLE IF NOT EXISTS module_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    module_name TEXT UNIQUE NOT NULL,
                    status TEXT NOT NULL,
                    version TEXT,
                    config TEXT,
                    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    error_count INTEGER DEFAULT 0,
                    last_error TEXT,
                    metrics TEXT,
                    is_enabled BOOLEAN DEFAULT 1
                )
            """)
            
            # Table Historique Ordres
            conn.execute("""
                CREATE TABLE IF NOT EXISTS command_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER NOT NULL,
                    module TEXT NOT NULL,
                    command TEXT NOT NULL,
                    parameters TEXT,
                    status TEXT DEFAULT 'pending',
                    result TEXT,
                    encrypted_payload TEXT,
                    execution_time REAL,
                    agent_id TEXT,
                    session_id TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Index pour performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_security_logs_module ON security_logs(module)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_command_history_user ON command_history(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_command_history_timestamp ON command_history(timestamp)")
            
            conn.commit()
            logger.info("Base de données SQLCipher initialisée")
    
    def create_user(self, username: str, password: str, email: str = None, role: str = 'operator') -> bool:
        """Crée un nouvel utilisateur"""
        try:
            password_hash = self.ph.hash(password)
            
            with self.get_connection() as conn:
                conn.execute("""
                    INSERT INTO users (username, password_hash, email, role)
                    VALUES (?, ?, ?, ?)
                """, (username, password_hash, email, role))
                conn.commit()
                
            logger.info(f"Utilisateur créé: {username}")
            return True
        except Exception as e:
            logger.error(f"Erreur création utilisateur: {e}")
            return False
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        """Authentifie un utilisateur"""
        try:
            with self.get_connection() as conn:
                user = conn.execute("""
                    SELECT * FROM users 
                    WHERE username = ? AND is_active = 1
                """, (username,)).fetchone()
                
                if not user:
                    return None
                
                # Vérifier si le compte est verrouillé
                if user['locked_until'] and datetime.fromisoformat(user['locked_until']) > datetime.now():
                    return None
                
                # Vérifier le mot de passe
                try:
                    self.ph.verify(user['password_hash'], password)
                    
                    # Réinitialiser les tentatives échouées
                    conn.execute("""
                        UPDATE users 
                        SET failed_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP
                        WHERE id = ?
                    """, (user['id'],))
                    conn.commit()
                    
                    return dict(user)
                    
                except Exception:
                    # Incrémenter les tentatives échouées
                    failed_attempts = user['failed_attempts'] + 1
                    locked_until = None
                    
                    if failed_attempts >= 3:
                        from datetime import timedelta
                        locked_until = (datetime.now() + timedelta(minutes=15)).isoformat()
                    
                    conn.execute("""
                        UPDATE users 
                        SET failed_attempts = ?, locked_until = ?
                        WHERE id = ?
                    """, (failed_attempts, locked_until, user['id']))
                    conn.commit()
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Erreur authentification: {e}")
            return None
    
    def register_agent(self, agent_id: str, name: str, agent_type: str, location: str = None, ip_address: str = None) -> bool:
        """Enregistre un nouvel agent"""
        try:
            config = json.dumps({
                'heartbeat_interval': 30,
                'encryption_enabled': True,
                'auto_update': True
            })
            
            with self.get_connection() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO agents 
                    (agent_id, name, type, location, ip_address, config, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'offline')
                """, (agent_id, name, agent_type, location, ip_address, config))
                conn.commit()
                
            logger.info(f"Agent enregistré: {agent_id}")
            return True
        except Exception as e:
            logger.error(f"Erreur enregistrement agent: {e}")
            return False
    
    def update_agent_status(self, agent_id: str, status: str, location: str = None) -> bool:
        """Met à jour le statut d'un agent"""
        try:
            with self.get_connection() as conn:
                conn.execute("""
                    UPDATE agents 
                    SET status = ?, last_seen = CURRENT_TIMESTAMP, location = COALESCE(?, location)
                    WHERE agent_id = ?
                """, (status, location, agent_id))
                conn.commit()
                
            return True
        except Exception as e:
            logger.error(f"Erreur mise à jour agent: {e}")
            return False
    
    def get_agents(self, status: str = None) -> List[Dict]:
        """Récupère la liste des agents"""
        try:
            with self.get_connection() as conn:
                if status:
                    agents = conn.execute("""
                        SELECT * FROM agents WHERE status = ?
                        ORDER BY last_seen DESC
                    """, (status,)).fetchall()
                else:
                    agents = conn.execute("""
                        SELECT * FROM agents
                        ORDER BY last_seen DESC
                    """).fetchall()
                
                return [dict(agent) for agent in agents]
        except Exception as e:
            logger.error(f"Erreur récupération agents: {e}")
            return []
    
    def log_security_event(self, level: str, module: str, event_type: str, message: str, 
                          details: Dict = None, user_id: int = None, agent_id: str = None, 
                          ip_address: str = None, session_id: str = None) -> bool:
        """Enregistre un événement de sécurité"""
        try:
            encrypted_details = None
            if details:
                encrypted_details = self._encrypt_data(json.dumps(details))
            
            with self.get_connection() as conn:
                conn.execute("""
                    INSERT INTO security_logs 
                    (level, module, event_type, message, encrypted_details, user_id, agent_id, ip_address, session_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (level, module, event_type, message, encrypted_details, user_id, agent_id, ip_address, session_id))
                conn.commit()
                
            return True
        except Exception as e:
            logger.error(f"Erreur log sécurité: {e}")
            return False
    
    def get_security_logs(self, limit: int = 100, level: str = None, module: str = None) -> List[Dict]:
        """Récupère les logs de sécurité"""
        try:
            with self.get_connection() as conn:
                query = "SELECT * FROM security_logs"
                params = []
                
                conditions = []
                if level:
                    conditions.append("level = ?")
                    params.append(level)
                if module:
                    conditions.append("module = ?")
                    params.append(module)
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
                
                query += " ORDER BY timestamp DESC LIMIT ?"
                params.append(limit)
                
                logs = conn.execute(query, params).fetchall()
                
                # Déchiffrer les détails
                result = []
                for log in logs:
                    log_dict = dict(log)
                    if log_dict['encrypted_details']:
                        try:
                            decrypted = self._decrypt_data(log_dict['encrypted_details'])
                            log_dict['details'] = json.loads(decrypted)
                        except:
                            log_dict['details'] = None
                    result.append(log_dict)
                
                return result
        except Exception as e:
            logger.error(f"Erreur récupération logs: {e}")
            return []
    
    def update_module_status(self, module_name: str, status: str, version: str = None, 
                           config: Dict = None, metrics: Dict = None, error: str = None) -> bool:
        """Met à jour le statut d'un module"""
        try:
            config_json = json.dumps(config) if config else None
            metrics_json = json.dumps(metrics) if metrics else None
            
            with self.get_connection() as conn:
                # Vérifier si le module existe
                existing = conn.execute("""
                    SELECT id FROM module_status WHERE module_name = ?
                """, (module_name,)).fetchone()
                
                if existing:
                    conn.execute("""
                        UPDATE module_status 
                        SET status = ?, version = COALESCE(?, version), 
                            config = COALESCE(?, config), metrics = COALESCE(?, metrics),
                            last_error = ?, last_update = CURRENT_TIMESTAMP,
                            error_count = CASE WHEN ? IS NOT NULL THEN error_count + 1 ELSE error_count END
                        WHERE module_name = ?
                    """, (status, version, config_json, metrics_json, error, error, module_name))
                else:
                    conn.execute("""
                        INSERT INTO module_status 
                        (module_name, status, version, config, metrics, last_error, error_count)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (module_name, status, version, config_json, metrics_json, error, 1 if error else 0))
                
                conn.commit()
            return True
        except Exception as e:
            logger.error(f"Erreur mise à jour module: {e}")
            return False
    
    def get_module_status(self, module_name: str = None) -> List[Dict]:
        """Récupère le statut des modules"""
        try:
            with self.get_connection() as conn:
                if module_name:
                    modules = conn.execute("""
                        SELECT * FROM module_status WHERE module_name = ?
                    """, (module_name,)).fetchall()
                else:
                    modules = conn.execute("""
                        SELECT * FROM module_status ORDER BY module_name
                    """).fetchall()
                
                result = []
                for module in modules:
                    module_dict = dict(module)
                    if module_dict['config']:
                        try:
                            module_dict['config'] = json.loads(module_dict['config'])
                        except:
                            pass
                    if module_dict['metrics']:
                        try:
                            module_dict['metrics'] = json.loads(module_dict['metrics'])
                        except:
                            pass
                    result.append(module_dict)
                
                return result
        except Exception as e:
            logger.error(f"Erreur récupération statut modules: {e}")
            return []
    
    def log_command(self, user_id: int, module: str, command: str, parameters: Dict = None, 
                   agent_id: str = None, session_id: str = None) -> int:
        """Enregistre une commande dans l'historique"""
        try:
            parameters_json = json.dumps(parameters) if parameters else None
            encrypted_payload = None
            
            if parameters:
                encrypted_payload = self._encrypt_data(parameters_json)
            
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    INSERT INTO command_history 
                    (user_id, module, command, parameters, encrypted_payload, agent_id, session_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, module, command, parameters_json, encrypted_payload, agent_id, session_id))
                conn.commit()
                
                return cursor.lastrowid
        except Exception as e:
            logger.error(f"Erreur log commande: {e}")
            return None
    
    def update_command_result(self, command_id: int, status: str, result: str = None, execution_time: float = None) -> bool:
        """Met à jour le résultat d'une commande"""
        try:
            with self.get_connection() as conn:
                conn.execute("""
                    UPDATE command_history 
                    SET status = ?, result = ?, execution_time = ?
                    WHERE id = ?
                """, (status, result, execution_time, command_id))
                conn.commit()
                
            return True
        except Exception as e:
            logger.error(f"Erreur mise à jour commande: {e}")
            return False
    
    def get_command_history(self, user_id: int = None, module: str = None, limit: int = 100) -> List[Dict]:
        """Récupère l'historique des commandes"""
        try:
            with self.get_connection() as conn:
                query = """
                    SELECT ch.*, u.username 
                    FROM command_history ch
                    LEFT JOIN users u ON ch.user_id = u.id
                """
                params = []
                
                conditions = []
                if user_id:
                    conditions.append("ch.user_id = ?")
                    params.append(user_id)
                if module:
                    conditions.append("ch.module = ?")
                    params.append(module)
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
                
                query += " ORDER BY ch.timestamp DESC LIMIT ?"
                params.append(limit)
                
                commands = conn.execute(query, params).fetchall()
                
                # Déchiffrer les payloads
                result = []
                for cmd in commands:
                    cmd_dict = dict(cmd)
                    if cmd_dict['encrypted_payload']:
                        try:
                            decrypted = self._decrypt_data(cmd_dict['encrypted_payload'])
                            cmd_dict['decrypted_parameters'] = json.loads(decrypted)
                        except:
                            cmd_dict['decrypted_parameters'] = None
                    result.append(cmd_dict)
                
                return result
        except Exception as e:
            logger.error(f"Erreur récupération historique: {e}")
            return []
    
    def cleanup_old_data(self, days: int = 30) -> bool:
        """Nettoie les anciennes données"""
        try:
            with self.get_connection() as conn:
                # Nettoyer les anciens logs
                conn.execute("""
                    DELETE FROM security_logs 
                    WHERE timestamp < datetime('now', '-{} days')
                """.format(days))
                
                # Nettoyer l'ancien historique de commandes
                conn.execute("""
                    DELETE FROM command_history 
                    WHERE timestamp < datetime('now', '-{} days')
                """.format(days))
                
                conn.commit()
                
            logger.info(f"Nettoyage des données > {days} jours effectué")
            return True
        except Exception as e:
            logger.error(f"Erreur nettoyage: {e}")
            return False