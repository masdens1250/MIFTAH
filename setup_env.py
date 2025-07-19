#!/usr/bin/env python3
"""
MIFTAH - Configuration environnement
Automatise la création et configuration de l'environnement virtuel
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Vérifie la version Python (3.12+ requis)"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 12):
        print(f"❌ Python 3.12+ requis. Version actuelle: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} détecté")
    return True

def create_virtual_env():
    """Crée l'environnement virtuel"""
    try:
        print("🔧 Création de l'environnement virtuel...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Environnement virtuel créé")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur création venv: {e}")
        return False

def get_activation_command():
    """Retourne la commande d'activation selon l'OS"""
    if platform.system() == "Windows":
        return "venv\\Scripts\\activate"
    else:
        return "source venv/bin/activate"

def install_requirements():
    """Instructions pour installer les dépendances"""
    activation_cmd = get_activation_command()
    
    print("\n📦 Pour installer les dépendances:")
    print(f"1. Activez l'environnement: {activation_cmd}")
    print("2. Installez les packages: pip install -r requirements.txt")
    
    print("\n🔐 Dépendances MIFTAH:")
    with open("requirements.txt", "r") as f:
        for line in f:
            if line.strip():
                print(f"   • {line.strip()}")

def main():
    """Configuration principale"""
    print("🛡️  MIFTAH - Configuration Environnement")
    print("=" * 40)
    
    if not check_python_version():
        sys.exit(1)
    
    if not os.path.exists("venv"):
        if not create_virtual_env():
            sys.exit(1)
    else:
        print("✅ Environnement virtuel déjà présent")
    
    install_requirements()
    
    print("\n🚀 Environnement prêt pour MIFTAH!")
    print("   Suivez les instructions ci-dessus pour activer et installer les dépendances.")

if __name__ == "__main__":
    main()