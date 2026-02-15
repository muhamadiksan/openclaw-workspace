#!/bin/bash

# Setup Auto-Sync Cron Job for GitHub
# This script sets up automatic syncing every 5 minutes

set -e

# Script configuration
SYNC_SCRIPT="/root/.openclaw/workspace/github-sync.sh"
CRON_JOB="*/5 * * * * cd /root/.openclaw/workspace && $SYNC_SCRIPT >> /root/.openclaw/workspace/logs/github-sync.log 2>&1"
LOG_DIR="/root/.openclaw/workspace/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Ensure logs directory exists
mkdir -p "$LOG_DIR"

# Function to check if cron job exists
check_cron_job_exists() {
    crontab -l 2>/dev/null | grep -q "$SYNC_SCRIPT"
}

# Function to add cron job
add_cron_job() {
    log_info "Setting up auto-sync cron job..."
    
    # Get current crontab
    current_crontab=$(crontab -l 2>/dev/null || echo "")
    
    # Add our cron job if it doesn't exist
    if ! echo "$current_crontab" | grep -q "$SYNC_SCRIPT"; then
        echo -e "$current_crontab\n$CRON_JOB" | crontab -
        log_info "✅ Cron job added successfully"
        return 0
    else
        log_warn "Cron job already exists"
        return 1
    fi
}

# Function to remove cron job
remove_cron_job() {
    log_info "Removing auto-sync cron job..."
    
    # Get current crontab and filter out our job
    current_crontab=$(crontab -l 2>/dev/null || echo "")
    filtered_crontab=$(echo "$current_crontab" | grep -v "$SYNC_SCRIPT")
    
    if [ "$current_crontab" != "$filtered_crontab" ]; then
        echo "$filtered_crontab" | crontab -
        log_info "✅ Cron job removed successfully"
        return 0
    else
        log_warn "Cron job not found"
        return 1
    fi
}

# Function to show current cron status
show_cron_status() {
    log_info "Current cron jobs:"
    crontab -l 2>/dev/null || log_info "No cron jobs found"
}

# Function to test sync script
test_sync_script() {
    log_info "Testing sync script..."
    
    if [ -f "$SYNC_SCRIPT" ]; then
        chmod +x "$SYNC_SCRIPT"
        if "$SYNC_SCRIPT"; then
            log_info "✅ Sync script test successful"
            return 0
        else
            log_error "❌ Sync script test failed"
            return 1
        fi
    else
        log_error "❌ Sync script not found: $SYNC_SCRIPT"
        return 1
    fi
}

# Show current status
show_current_status() {
    echo ""
    echo "==========================================="
    echo "GitHub Auto-Sync Status"
    echo "==========================================="
    echo "Sync Script: $SYNC_SCRIPT"
    echo "Log File: $LOG_DIR/github-sync.log"
    echo "Cron Frequency: Every 5 minutes"
    echo ""
    
    show_cron_status
    echo ""
    
    if check_cron_job_exists; then
        log_info "✅ Auto-sync is ACTIVE"
    else
        log_warn "⚠️ Auto-sync is INACTIVE"
    fi
    
    echo ""
}

# Main function
main() {
    case "${1:-status}" in
        "install")
            test_sync_script
            add_cron_job
            show_current_status
            ;;
        "remove")
            remove_cron_job
            show_current_status
            ;;
        "status")
            show_current_status
            ;;
        "test")
            test_sync_script
            ;;
        *)
            echo "Usage: $0 {install|remove|status|test}"
            echo "  install  - Setup auto-sync cron job"
            echo "  remove   - Remove auto-sync cron job"
            echo "  status   - Show current status"
            echo "  test     - Test sync script"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"