#!/usr/bin/env python3
"""
MIFTAH - Application principale
Hub de cybersécurité SPARTA
"""

import os
import sys
from pathlib import Path
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_socketio import SocketIO, emit
import logging
from datetime import datetime
import argon2

# Import configuration
from config import get_config, validate_environment
from core.database.models import DatabaseManager

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MiftahApp:
    """Application principale MIFTAH"""
    
    def __init__(self):
        self.app = None
        self.socketio = None
        self.db = None
        self.config = get_config()
        self.setup_app()
        self.setup_database()
    
    def setup_app(self):
        """Configuration Flask"""
        self.app = Flask(__name__)
        
        # Configuration
        self.app.config.update(
            SECRET_KEY=self.config['app'].SECRET_KEY,
            DEBUG=self.config['app'].DEBUG
        )
        
        # Initialize Argon2 hasher
        self.ph = argon2.PasswordHasher()
        
        # SocketIO
        self.socketio = SocketIO(
            self.app,
            async_mode=self.config['socket'].ASYNC_MODE,
            cors_allowed_origins=self.config['socket'].CORS_ALLOWED_ORIGINS
        )
        
        # Routes
        self.setup_routes()
        self.setup_socket_events()
        
        # Headers sécurisés
        self.setup_security_headers()
    
    def setup_database(self):
        """Configuration base de données SQLCipher"""
        try:
            self.db = DatabaseManager(
                db_path=str(self.config['database'].DB_PATH),
                db_key=self.config['database'].DB_KEY
            )
            logger.info("Base de données SQLCipher connectée")
        except Exception as e:
            logger.error(f"Erreur connexion base de données: {e}")
            raise
    
    def setup_routes(self):
        """Configuration des routes"""
        
        @self.app.route('/')
        def index():
            """Page d'accueil - Redirection vers login"""
            if session.get('authenticated'):
                return redirect(url_for('dashboard'))
            return render_template('login.html')
        
        @self.app.route('/login', methods=['GET', 'POST'])
        def login():
            """Authentification"""
            if request.method == 'POST':
                data = request.get_json()
                username = data.get('username')
                password = data.get('password')
                
                # Authentification via base de données
                user = self.db.authenticate_user(username, password)
                if user:
                    session['authenticated'] = True
                    session['username'] = username
                    session['user_id'] = user['id']
                    session['role'] = user['role']
                    session['login_time'] = datetime.now().isoformat()
                    
                    # Log de connexion
                    self.db.log_security_event(
                        level='INFO',
                        module='AUTH',
                        event_type='login_success',
                        message=f'Connexion utilisateur: {username}',
                        user_id=user['id'],
                        ip_address=request.remote_addr,
                        session_id=session.get('session_id')
                    )
                    
                    logger.info(f"Connexion réussie: {username}")
                    return jsonify({'success': True, 'redirect': '/dashboard'})
                else:
                    # Log de tentative échouée
                    self.db.log_security_event(
                        level='WARNING',
                        module='AUTH',
                        event_type='login_failed',
                        message=f'Tentative connexion échouée: {username}',
                        ip_address=request.remote_addr
                    )
                    
                    logger.warning(f"Tentative connexion échouée: {username}")
                    return jsonify({'success': False, 'error': 'Identifiants invalides'})
            
            if session.get('authenticated'):
                return redirect(url_for('dashboard'))
            return render_template('login.html')
        
        @self.app.route('/logout', methods=['POST'])
        def logout():
            """Déconnexion"""
            username = session.get('username', 'Unknown')
            user_id = session.get('user_id')
            
            # Log de déconnexion
            if user_id:
                self.db.log_security_event(
                    level='INFO',
                    module='AUTH',
                    event_type='logout',
                    message=f'Déconnexion utilisateur: {username}',
                    user_id=user_id,
                    ip_address=request.remote_addr
                )
            
            session.clear()
            logger.info(f"Déconnexion: {username}")
            return jsonify({'success': True})
        
        @self.app.route('/dashboard')
        def dashboard():
            """Tableau de bord principal"""
            if not session.get('authenticated'):
                return redirect(url_for('index'))
            
            return render_template('dashboard.html', 
                                 current_time=datetime.now(),
                                 session=session)
        
        @self.app.route('/api/status')
        def api_status():
            """API - Statut système"""
            modules_status = self.db.get_module_status()
            modules_dict = {module['module_name'].lower(): {
                'status': module['status'],
                'enabled': module['is_enabled']
            } for module in modules_status}
            
            return jsonify({
                'status': 'online',
                'timestamp': datetime.now().isoformat(),
                'modules': modules_dict
            })
        
        @self.app.route('/api/agents')
        def api_agents():
            """API - Liste des agents"""
            agents = self.db.get_agents()
            return jsonify({
                'agents': agents,
                'total': len(agents),
                'active': len([a for a in agents if a['status'] == 'active'])
            })
        
        @self.app.route('/api/logs')
        def api_logs():
            """API - Logs de sécurité"""
            limit = request.args.get('limit', 50, type=int)
            level = request.args.get('level')
            module = request.args.get('module')
            
            logs = self.db.get_security_logs(limit=limit, level=level, module=module)
            return jsonify({
                'logs': logs,
                'total': len(logs)
            })
        
        @self.app.route('/api/modules')
        def api_modules():
            """API - Statut des modules"""
            modules = self.db.get_module_status()
            return jsonify({
                'modules': modules
            })
        
        @self.app.errorhandler(404)
        def not_found(error):
            return render_template('error.html', error_code=404), 404
        
        @self.app.errorhandler(500)
        def server_error(error):
            return render_template('error.html', error_code=500), 500
    
    def setup_socket_events(self):
        """Configuration événements WebSocket"""
        
        @self.socketio.on('connect')
        def handle_connect():
            """Connexion WebSocket"""
            logger.info(f"Client connecté: {request.sid}")
            emit('status', {'message': 'Connexion établie'})
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Déconnexion WebSocket"""
            logger.info(f"Client déconnecté: {request.sid}")
        
        @self.socketio.on('system_status')
        def handle_system_status():
            """Demande statut système"""
            # Récupérer les métriques réelles
            agents = self.db.get_agents()
            active_agents = len([a for a in agents if a['status'] == 'active'])
            
            modules = self.db.get_module_status()
            modules_status = {module['module_name'].lower(): module['status'] for module in modules}
            
            emit('system_status', {
                'agents': {
                    'total': len(agents),
                    'active': active_agents,
                    'offline': len(agents) - active_agents
                },
                'modules': modules_status,
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'cpu': 23,  # TODO: Métriques système réelles
                    'memory': 45,
                    'network': 12
                }
            })
        
        @self.socketio.on('module_changed')
        def handle_module_changed(data):
            """Module changé"""
            module = data.get('module')
            user_id = session.get('user_id')
            
            if user_id:
                self.db.log_security_event(
                    level='INFO',
                    module='UI',
                    event_type='module_navigation',
                    message=f'Navigation vers module: {module}',
                    user_id=user_id,
                    session_id=session.get('session_id')
                )
            
            logger.info(f"Module actif changé: {module}")
        
        @self.socketio.on('agent_command')
        def handle_agent_command(data):
            """Commande vers agent"""
            user_id = session.get('user_id')
            if not user_id:
                emit('error', {'message': 'Non authentifié'})
                return
            
            agent_id = data.get('agent_id')
            command = data.get('command')
            parameters = data.get('parameters', {})
            
            # Enregistrer la commande
            command_id = self.db.log_command(
                user_id=user_id,
                module='AGENT',
                command=command,
                parameters=parameters,
                agent_id=agent_id,
                session_id=session.get('session_id')
            )
            
            # Log de sécurité
            self.db.log_security_event(
                level='INFO',
                module='AGENT',
                event_type='command_sent',
                message=f'Commande envoyée à {agent_id}: {command}',
                user_id=user_id,
                agent_id=agent_id
            )
            
            emit('command_logged', {'command_id': command_id})
    
    def setup_security_headers(self):
        """Configuration headers sécurisés"""
        @self.app.after_request
        def add_security_headers(response):
            for header, value in self.config['security'].SECURITY_HEADERS.items():
                response.headers[header] = value
            return response
    
    def run(self):
        """Lancement application"""
        # Validation environnement
        errors = validate_environment()
        if errors:
            logger.error("Erreurs configuration:")
            for error in errors:
                logger.error(f"  - {error}")
            sys.exit(1)
        
        logger.info("🛡️  MIFTAH Hub - Démarrage")
        logger.info(f"Mode: {'DEBUG' if self.config['app'].DEBUG else 'PRODUCTION'}")
        
        # Lancement serveur
        self.socketio.run(
            self.app,
            host=self.config['app'].HOST,
            port=self.config['app'].PORT,
            debug=self.config['app'].DEBUG
        )

def main():
    """Point d'entrée principal"""
    try:
        app = MiftahApp()
        app.run()
    except KeyboardInterrupt:
        logger.info("Arrêt MIFTAH Hub")
    except Exception as e:
        logger.error(f"Erreur critique: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()