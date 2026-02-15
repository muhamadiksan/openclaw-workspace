#!/bin/bash

# Complete OpenClaw Setup with GitHub Sync + Fallback System
# Integrasi semua komponen untuk continuous continuity

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/logs/setup.log"
GITHUB_REPO="https://github.com/yourusername/openclaw-workspace.git"  # Ganti dengan URL repo Anda

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
    echo "[STEP] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Ensure logs directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Function to check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        return 1
    fi
    
    # Check OpenClaw
    if ! command -v openclaw &> /dev/null; then
        log_error "OpenClaw is not installed"
        return 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        return 1
    fi
    
    log_info "✅ All prerequisites satisfied"
    return 0
}

# Function to configure GitHub remote
setup_github_remote() {
    log_step "Setting up GitHub remote..."
    
    cd "$SCRIPT_DIR"
    
    # Check if remote already exists
    if git remote -v | grep -q origin; then
        log_info "GitHub remote already configured"
        return 0
    fi
    
    # Prompt for GitHub repo URL
    echo "GitHub Repository Configuration:"
    echo "Please provide your GitHub repository URL (e.g., https://github.com/username/repo.git)"
    read -p "GitHub Repo URL: " github_url
    
    if [ -z "$github_url" ]; then
        log_error "GitHub URL cannot be empty"
        return 1
    fi
    
    # Add remote and set up tracking
    if git remote add origin "$github_url"; then
        log_info "✅ GitHub remote configured successfully"
        return 0
    else
        log_error "❌ Failed to configure GitHub remote"
        return 1
    fi
}

# Function to verify installation
verify_installation() {
    log_step "Verifying installation..."
    
    # Check GitHub sync
    if [ -f "$SCRIPT_DIR/github-sync.sh" ]; then
        log_info "✅ GitHub sync script exists"
    else
        log_error "❌ GitHub sync script not found"
        return 1
    fi
    
    # Check cron job
    if crontab -l 2>/dev/null | grep -q "github-sync.sh"; then
        log_info "✅ Auto-sync cron job is active"
    else
        log_error "❌ Auto-sync cron job not found"
        return 1
    fi
    
    # Check fallback setup
    if [ -f "$SCRIPT_DIR/fallback-setup.sh" ]; then
        log_info "✅ Fallback setup script exists"
    else
        log_error "❌ Fallback setup script not found"
        return 1
    fi
    
    log_info "✅ All components verified"
    return 0
}

# Function to show usage instructions
show_usage() {
    echo ""
    echo "=== OpenClaw Complete Setup Usage ==="
    echo ""
    echo "1. GitHub Sync:"
    echo "   ./github-sync.sh                    # Manual sync"
    echo "   ./setup-auto-sync.sh install       # Install auto-sync"
    echo "   ./setup-auto-sync.sh status         # Check status"
    echo ""
    echo "2. Fallback System:"
    echo "   ./fallback-setup.sh setup           # Setup OpenClaw 2 fallback"
    echo "   ./fallback-setup.sh check          # Check fallback status"
    echo ""
    echo "3. Monitoring:"
    echo "   tail -f logs/github-sync.log      # Monitor sync logs"
    echo "   crontab -l                         # View cron jobs"
    echo ""
    echo "4. Git Operations:"
    echo "   git status                         # Check git status"
    echo "   git log --oneline                  # View commit history"
    echo ""
}

# Function to create status report
create_status_report() {
    local report_file="$SCRIPT_DIR/STATUS_REPORT.md"
    
    cat > "$report_file" << EOF
# OpenClaw Setup Status Report
Generated: $(date '+%Y-%m-%d %H:%M:%S UTC')

## System Status
- OpenClaw Workspace: $SCRIPT_DIR
- Git Status: $(cd "$SCRIPT_DIR" && git status --porcelain | wc -l | xargs echo "-") files tracked
- Auto-Sync: $(crontab -l 2>/dev/null | grep -q "github-sync.sh" && echo "✅ Active" || echo "❌ Inactive")
- Last Sync: $(cd "$SCRIPT_DIR" && git log -1 --format="%ci" --oneline || echo "Never")

## Configuration
- GitHub Remote: $(cd "$SCRIPT_DIR" && git remote -v | head -1 || echo "Not configured")
- Auto-Sync Frequency: Every 5 minutes
- Backup Location: $SCRIPT_DIR

## Scripts Location
- GitHub Sync: $SCRIPT_DIR/github-sync.sh
- Auto-Sync Setup: $SCRIPT_DIR/setup-auto-sync.sh  
- Fallback Setup: $SCRIPT_DIR/fallback-setup.sh
- Log Files: $SCRIPT_DIR/logs/

## Next Steps
1. Configure GitHub remote repository URL
2. Test fallback system when needed
3. Monitor sync logs regularly
4. Update fallback scripts with your Supabase credentials

EOF
    
    log_info "Status report created: $report_file"
}

# Main function
main() {
    local action="${1:-all}"
    
    echo "==========================================="
    echo "OpenClaw Complete Setup Integration"
    echo "==========================================="
    echo ""
    
    case "$action" in
        "prereq")
            check_prerequisites
            ;;
            
        "github")
            check_prerequisites
            setup_github_remote
            ;;
            
        "verify")
            verify_installation
            create_status_report
            ;;
            
        "all")
            log_info "Starting complete setup..."
            
            check_prerequisites
            setup_github_remote
            verify_installation
            create_status_report
            
            echo ""
            log_info "✅ Setup completed successfully!"
            show_usage
            ;;
            
        "status")
            create_status_report
            cat "$SCRIPT_DIR/STATUS_REPORT.md"
            ;;
            
        "help")
            show_usage
            ;;
            
        *)
            echo "Usage: $0 {prereq|github|verify|all|status|help}"
            echo "  prereq    - Check prerequisites only"
            echo "  github    - Setup GitHub remote only"
            echo "  verify    - Verify installation"
            echo "  all       - Complete setup (recommended)"
            echo "  status    - Show status report"
            echo "  help      - Show usage instructions"
            exit 1
            ;;
    esac
}

main "$@"