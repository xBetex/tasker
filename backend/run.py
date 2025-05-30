import os
import sys
import subprocess
import venv
import platform
import time

def create_venv():
    """Create a virtual environment if it doesn't exist."""
    if not os.path.exists('venv'):
        print("Creating virtual environment...")
        venv.create('venv', with_pip=True)
        # Wait a moment for the environment to be fully created
        time.sleep(2)
        return True
    return False

def get_python_executable():
    """Get the Python executable path based on the platform."""
    if platform.system() == "Windows":
        return os.path.join('venv', 'Scripts', 'python.exe')
    return os.path.join('venv', 'bin', 'python')

def get_pip_executable():
    """Get the pip executable path based on the platform."""
    if platform.system() == "Windows":
        return os.path.join('venv', 'Scripts', 'pip.exe')
    return os.path.join('venv', 'bin', 'pip')

def upgrade_pip():
    """Upgrade pip to the latest version."""
    python_exe = get_python_executable()
    print("Upgrading pip...")
    try:
        subprocess.check_call([python_exe, '-m', 'pip', 'install', '--upgrade', 'pip'])
    except subprocess.CalledProcessError:
        print("Warning: Failed to upgrade pip, continuing with existing version...")

def install_requirements():
    """Install the required packages."""
    pip_exe = get_pip_executable()
    print("Installing requirements...")
    # First try with regular install
    try:
        subprocess.check_call([pip_exe, 'install', '-r', 'requirements.txt'])
    except subprocess.CalledProcessError as e:
        print(f"Regular install failed, trying with --no-cache-dir...")
        # If regular install fails, try with no cache
        subprocess.check_call([pip_exe, 'install', '--no-cache-dir', '-r', 'requirements.txt'])

def run_app():
    """Run the FastAPI application."""
    python_exe = get_python_executable()
    print("Starting the application...")
    subprocess.check_call([python_exe, '-m', 'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'])

def main():
    """Main function to set up and run the application."""
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        # Create virtual environment if needed
        if create_venv():
            print("Virtual environment created successfully.")
        
        # Upgrade pip first
        upgrade_pip()
        
        # Install requirements
        install_requirements()
        
        # Run the application
        run_app()
        
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 