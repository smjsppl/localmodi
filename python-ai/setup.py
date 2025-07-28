#!/usr/bin/env python3
"""
Setup script for LocalModi Python AI Service
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up LocalModi Python AI Service...")
    print()
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    print(f"✅ Python {python_version.major}.{python_version.minor} detected")
    
    # Create virtual environment
    print("\n📦 Creating virtual environment...")
    if not run_command("python -m venv venv"):
        print("❌ Failed to create virtual environment")
        sys.exit(1)
    
    # Activate virtual environment and install packages
    print("\n📥 Installing dependencies...")
    
    # Windows activation
    activate_cmd = "venv\\Scripts\\activate"
    if os.name != 'nt':  # Unix/Linux/Mac
        activate_cmd = "source venv/bin/activate"
    
    install_commands = [
        f"{activate_cmd} && pip install --upgrade pip",
        f"{activate_cmd} && pip install -r requirements.txt",
    ]
    
    for cmd in install_commands:
        if not run_command(cmd):
            print(f"❌ Failed to run: {cmd}")
            sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Activate virtual environment:")
    if os.name == 'nt':  # Windows
        print("   venv\\Scripts\\activate")
    else:  # Unix/Linux/Mac
        print("   source venv/bin/activate")
    print("2. Start the AI service:")
    print("   python app.py")
    print("3. Service will be available at: http://localhost:5000")
    print("\n🔧 Test endpoints:")
    print("   GET  /health - Check service status")
    print("   POST /audio-to-text - Convert audio to text")
    print("   POST /image-to-text - Extract text from images")
    print("   POST /preprocess-text - Clean and normalize text")

if __name__ == "__main__":
    main()
