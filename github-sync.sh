#!/bin/bash

# GitHub Auto-Sync Script untuk OpenClaw Workspace
set -e

# Configuration
GIT_USER="openclaw-user"
GIT_EMAIL="openclaw@backup.com"
GIT_BRANCH="master"

# Simple logging
log_info() {
    echo "[INFO] $1"
}

log_error() {
    echo "[ERROR] $1"
}

# Check if git remote exists
check_remote_exists() {
    git remote -v | grep -q origin
}

# Function to auto-add and commit changes
auto_commit() {
    local commit_message="$1"
    
    # Stage all changes (excluding node_modules and logs)
    git add --ignore-submodules --all -- \
        !node_modules/ \
        !logs/ \
        !.gitignore \
        || {
            log_info "Some files excluded from staging"
            git add --all --ignore-submodules -- \
                !node_modules/ \
                !logs/ || log_error "Failed to stage files"
        }
    
    # Check if there are changes to commit
    if ! git diff --cached --quiet; then
        log_info "Staging changes..."
        git commit -m "$commit_message" --author="$GIT_USER <$GIT_EMAIL>"
        log_info "Changes committed successfully"
        return 0
    else
        log_info "No changes to commit"
        return 1
    fi
}

# Function to pull latest changes
pull_latest() {
    log_info "Pulling latest changes..."
    if git pull origin "$GIT_BRANCH" 2>/dev/null; then
        log_info "Pulled latest changes successfully"
        return 0
    else
        log_error "No remote repository or connection failed"
        return 1
    fi
}

# Function to push to remote
push_to_remote() {
    if git push origin "$GIT_BRANCH" 2>/dev/null; then
        log_info "Pushed to remote successfully"
        return 0
    else
        log_error "Failed to push - no remote or connection issue"
        return 1
    fi
}

# Main function
main() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S UTC')
    local commit_message="auto-sync: Auto-sync at $timestamp"
    
    log_info "Starting GitHub auto-sync..."
    log_info "Timestamp: $timestamp"
    log_info "Working directory: $(pwd)"
    
    # Pull latest if remote exists
    if check_remote_exists; then
        pull_latest
    else
        log_info "No remote repository configured"
    fi
    
    # Commit changes
    if auto_commit "$commit_message"; then
        # Push to remote if exists
        if check_remote_exists; then
            if push_to_remote; then
                log_info "✅ Sync completed successfully!"
            else
                log_error "❌ Push failed"
                exit 1
            fi
        else
            log_info "✅ Changes committed (no remote to push to)"
        fi
    else
        log_info "✅ No changes to sync"
    fi
    
    # Show git status
    log_info "Current git status:"
    git status --porcelain
}

# Run main function
main "$@"