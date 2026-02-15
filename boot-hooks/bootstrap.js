const fs = require('fs');
const path = require('path');

async function bootstrapHook(memoryManager, workspaceDir = '/root/.openclaw/workspace') {
    // Check if we need bootstrap
    const identityFile = path.join(workspaceDir, 'IDENTITY.md');
    const userFile = path.join(workspaceDir, 'USER.md');
    
    const needsBootstrap = !fs.existsSync(identityFile) || 
                         !fs.readFileSync(identityFile, 'utf8').includes('Name:') ||
                         !fs.existsSync(userFile) ||
                         !fs.readFileSync(userFile, 'utf8').includes('Name:');
    
    if (needsBootstrap) {
        memoryManager.logEvent('Bootstrap needed - identities not configured', 'bootstrap');
    } else {
        memoryManager.logEvent('Bootstrap complete - identities configured', 'bootstrap');
    }
}

module.exports = { run: bootstrapHook };