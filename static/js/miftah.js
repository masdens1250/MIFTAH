/**
 * MIFTAH Hub - JavaScript principal
 * Gestion des interactions et communications temps réel
 */

class MiftahHub {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.modules = ['omega', 'atlas', 'prolitage'];
        this.currentModule = 'overview';
        
        this.init();
    }
    
    init() {
        console.log('🛡️ MIFTAH Hub - Initialisation');
        
        // Initialize Socket.IO if available
        if (typeof io !== 'undefined') {
            this.initSocket();
        }
        
        // Initialize UI components
        this.initNavigation();
        this.initSystemMonitoring();
        this.initEventListeners();
        
        console.log('✅ MIFTAH Hub - Prêt');
    }
    
    initSocket() {
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('🔗 WebSocket connecté');
                this.isConnected = true;
                this.updateConnectionStatus(true);
            });
            
            this.socket.on('disconnect', () => {
                console.log('❌ WebSocket déconnecté');
                this.isConnected = false;
                this.updateConnectionStatus(false);
            });
            
            this.socket.on('system_status', (data) => {
                this.updateSystemMetrics(data);
            });
            
            this.socket.on('module_status', (data) => {
                this.updateModuleStatus(data);
            });
            
            this.socket.on('log_entry', (data) => {
                this.addLogEntry(data);
            });
            
        } catch (error) {
            console.error('Erreur Socket.IO:', error);
        }
    }
    
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const moduleContents = document.querySelectorAll('.module-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const module = item.dataset.module;
                if (module) {
                    this.switchModule(module);
                }
            });
        });
    }
    
    switchModule(module) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[data-module="${module}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
        
        // Update content
        document.querySelectorAll('.module-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        const targetContent = document.getElementById(`${module}-content`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
        
        this.currentModule = module;
        
        // Emit module change event
        if (this.socket && this.isConnected) {
            this.socket.emit('module_changed', { module: module });
        }
        
        console.log(`📱 Module actif: ${module}`);
    }
    
    initSystemMonitoring() {
        // Update system time
        this.updateSystemTime();
        setInterval(() => this.updateSystemTime(), 1000);
        
        // Request initial system status
        if (this.socket) {
            setTimeout(() => {
                this.socket.emit('system_status');
            }, 1000);
        }
    }
    
    updateSystemTime() {
        const timeElement = document.getElementById('systemTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    updateConnectionStatus(connected) {
        const statusElements = document.querySelectorAll('.connection-status');
        statusElements.forEach(element => {
            if (connected) {
                element.classList.remove('status-error');
                element.classList.add('status-online');
                element.textContent = 'Système en ligne';
            } else {
                element.classList.remove('status-online');
                element.classList.add('status-error');
                element.textContent = 'Connexion perdue';
            }
        });
    }
    
    updateSystemMetrics(data) {
        // Update CPU usage
        const cpuElement = document.getElementById('cpu-usage');
        if (cpuElement && data.cpu !== undefined) {
            cpuElement.textContent = `${data.cpu}%`;
            this.updateProgressBar('cpu-progress', data.cpu);
        }
        
        // Update Memory usage
        const memoryElement = document.getElementById('memory-usage');
        if (memoryElement && data.memory !== undefined) {
            memoryElement.textContent = `${data.memory}%`;
            this.updateProgressBar('memory-progress', data.memory);
        }
        
        // Update Network usage
        const networkElement = document.getElementById('network-usage');
        if (networkElement && data.network !== undefined) {
            networkElement.textContent = `${data.network}%`;
            this.updateProgressBar('network-progress', data.network);
        }
    }
    
    updateProgressBar(elementId, value) {
        const progressBar = document.getElementById(elementId);
        if (progressBar) {
            progressBar.style.width = `${value}%`;
            
            // Update color based on value
            progressBar.classList.remove('progress-fill.success', 'progress-fill.warning', 'progress-fill.danger');
            if (value < 60) {
                progressBar.classList.add('progress-fill.success');
            } else if (value < 80) {
                progressBar.classList.add('progress-fill.warning');
            } else {
                progressBar.classList.add('progress-fill.danger');
            }
        }
    }
    
    updateModuleStatus(data) {
        this.modules.forEach(module => {
            const statusElement = document.querySelector(`[data-module="${module}"] .module-status`);
            if (statusElement && data[module]) {
                statusElement.setAttribute('data-status', data[module].status);
            }
        });
    }
    
    addLogEntry(data) {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timestamp = new Date(data.timestamp).toLocaleTimeString('fr-FR');
        
        logEntry.innerHTML = `
            <div class="log-timestamp">${timestamp}</div>
            <div class="log-level ${data.level.toLowerCase()}">${data.level}</div>
            <div class="log-message">${data.message}</div>
        `;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Keep only last 100 entries
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[entries.length - 1].remove();
        }
    }
    
    initEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D for dashboard
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.switchModule('overview');
            }
            
            // Ctrl+Shift+L for logs
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.switchModule('logs');
            }
        });
        
        // Window focus/blur events
        window.addEventListener('focus', () => {
            if (this.socket && !this.isConnected) {
                this.socket.connect();
            }
        });
        
        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.isConnected) {
                e.preventDefault();
                e.returnValue = 'Êtes-vous sûr de vouloir quitter MIFTAH Hub ?';
            }
        });
    }
    
    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days}j ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
}

// Global functions
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        fetch('/logout', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Erreur lors de la déconnexion');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        });
    }
}

// Initialize MIFTAH Hub when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.miftahHub = new MiftahHub();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiftahHub;
}