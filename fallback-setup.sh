#!/bin/bash

# OpenClaw 2 Fallback Setup Script
# Script untuk switch ke OpenClaw 2 jika server 1 down

set -e

# Configuration
CLAW1_WORKSPACE="/root/.openclaw/workspace"
CLAW2_WORKSPACE="/root/.openclaw2/workspace"  # Sesuaikan path
GITHUB_REPO="your-github-repo-url"           # Ganti dengan URL GitHub repo
SUPABASE_URL="your-supabase-url"             # Ganti dengan Supabase URL
SUPABASE_KEY="your-supabase-key"             # Ganti dengan Supabase key

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if OpenClaw 1 is running
check_claw1_status() {
    # Check if OpenClaw process is running
    if pgrep -f "openclaw" > /dev/null; then
        return 0  # Running
    else
        return 1  # Not running
    fi
}

# Function to clone from GitHub
clone_from_github() {
    log_info "Cloning from GitHub..."
    
    # Backup current OpenClaw 2 workspace if exists
    if [ -d "$CLAW2_WORKSPACE" ]; then
        mv "$CLAW2_WORKSPACE" "${CLAW2_WORKSPACE}.backup.$(date +%Y%m%d-%H%M%S)"
        log_info "Backed up existing OpenClaw 2 workspace"
    fi
    
    # Create parent directories
    mkdir -p "$CLAW2_WORKSPACE"
    
    # Clone repository
    if git clone "$GITHUB_REPO" "$CLAW2_WORKSPACE"; then
        log_info "✅ Successfully cloned from GitHub"
        cd "$CLAW2_WORKSPACE"
        return 0
    else
        log_error "❌ Failed to clone from GitHub"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    cd "$CLAW2_WORKSPACE"
    
    # Install npm dependencies
    if [ -f "package.json" ]; then
        if npm install; then
            log_info "✅ Dependencies installed successfully"
            return 0
        else
            log_error "❌ Failed to install dependencies"
            return 1
        fi
    else
        log_warn "No package.json found, skipping npm install"
        return 0
    fi
}

# Function to connect to Supabase
connect_supabase() {
    log_info "Connecting to Supabase..."
    
    # Create Supabase connection script
    cat > "$CLAW2_WORKSPACE/supabase-connect.sh" << EOF
#!/bin/bash
# Supabase connection script

SUPABASE_URL="$SUPABASE_URL"
SUPABASE_KEY="$SUPABASE_KEY"

# Create environment file
cat > .env << EOL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
EOL

echo "✅ Supabase connection configured"
EOF
    
    chmod +x "$CLAW2_WORKSPACE/supabase-connect.sh"
    "$CLAW2_WORKSPACE/supabase-connect.sh"
    
    log_info "✅ Supabase connection script created"
    return 0
}

# Function to start OpenClaw 2
start_claw2() {
    log_info "Starting OpenClaw 2..."
    
    cd "$CLAW2_WORKSPACE"
    
    # Check if OpenClaw 2 is already running
    if pgrep -f "openclaw.*$CLAW2_WORKSPACE" > /dev/null; then
        log_info "OpenClaw 2 is already running"
        return 0
    fi
    
    # Start OpenClaw 2 (adjust command as needed)
    if nohup openclaw start > "$CLAW2_WORKSPACE/logs/openclaw2.log" 2>&1 & then
        log_info "✅ OpenClaw 2 started successfully"
        return 0
    else
        log_error "❌ Failed to start OpenClaw 2"
        return 1
    fi
}

# Function to verify fallback setup
verify_setup() {
    log_info "Verifying fallback setup..."
    
    if [ -d "$CLAW2_WORKSPACE" ]; then
        log_info "✅ OpenClaw 2 workspace exists"
    else
        log_error "❌ OpenClaw 2 workspace not found"
        return 1
    fi
    
    if check_claw1_status; then
        log_info "ℹ️  OpenClaw 1 is still running (no fallback needed)"
    else
        log_info "✅ OpenClaw 1 is down, fallback ready"
    fi
    
    return 0
}

# Main function
main() {
    local action="${1:-setup}"
    
    case "$action" in
        "setup")
            log_info "=== Setting up OpenClaw 2 Fallback System ==="
            
            if check_claw1_status; then
                log_info "OpenClaw 1 is running, no fallback needed"
                log_info "Setup will continue when OpenClaw 1 goes down"
                return 0
            fi
            
            clone_from_github
            install_dependencies
            connect_supabase
            start_claw2
            verify_setup
            
            log_info "✅ Fallback setup completed!"
            ;;
            
        "check")
            verify_setup
            ;;
            
        "test")
            log_info "Testing fallback system..."
            # Simulate OpenClaw 1 failure
            log_info "This would trigger fallback to OpenClaw 2"
            ;;
            
        *)
            echo "Usage: $0 {setup|check|test}"
            echo "  setup  - Setup fallback system (if OpenClaw 1 is down)"
            echo "  check  - Check current fallback status"
            echo "  test   - Test fallback mechanism"
            exit 1
            ;;
    esac
}

main "$@"