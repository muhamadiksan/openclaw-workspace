const fs = require('fs');
const path = require('path');

class BootHooks {
    constructor(workspaceDir = '/root/.openclaw/workspace') {
        this.workspaceDir = workspaceDir;
        this.hooksDir = path.join(workspaceDir, 'boot-hooks');
        this.ensureHooksDirectory();
        this.memoryManager = new (require('./memory-manager'))(workspaceDir);
    }

    ensureHooksDirectory() {
        if (!fs.existsSync(this.hooksDir)) {
            fs.mkdirSync(this.hooksDir, { recursive: true });
        }
    }

    addHook(hookName, hookFunction, priority = 0) {
        const hookFile = path.join(this.hooksDir, `${hookName}.js`);
        
        const hookContent = `
// Boot Hook: ${hookName}
// Priority: ${priority}
// Added: ${new Date().toISOString()}

const fs = require('fs');
const path = require('path');

async function ${hookName}Hook(memoryManager, workspaceDir = '${this.workspaceDir}') {
${hookFunction.toString().replace('async (memoryManager) => {', '').replace('}', '').split('\n').slice(1, -1).join('\n').split('\n').map(line => '    ' + line).join('\n')}
}

module.exports = { run: ${hookName}Hook };
`;

        fs.writeFileSync(hookFile, hookContent);
        this.memoryManager.logEvent(`Boot hook added: ${hookName}`, 'system');
    }

    async runHooks(hookType = 'startup') {
        const hooks = [];
        
        if (fs.existsSync(this.hooksDir)) {
            const hookFiles = fs.readdirSync(this.hooksDir)
                .filter(file => file.endsWith('.js'))
                .sort((a, b) => {
                    // Sort by priority (encoded in filename)
                    const aPriority = this.getHookPriority(a);
                    const bPriority = this.getHookPriority(b);
                    return aPriority - bPriority;
                });

            for (const hookFile of hookFiles) {
                try {
                    const hookPath = path.join(this.hooksDir, hookFile);
                    const hookModule = require(hookPath);
                    
                    if (hookModule.run && typeof hookModule.run === 'function') {
                        await hookModule.run(this.memoryManager);
                        this.memoryManager.logEvent(`Hook executed: ${hookFile}`, 'system');
                    }
                } catch (error) {
                    this.memoryManager.logEvent(`Hook error ${hookFile}: ${error.message}`, 'error');
                }
            }
        }
    }

    getHookPriority(filename) {
        // Extract priority from filename (e.g., "01-hookname.js" = priority 1)
        const match = filename.match(/^(\d+)-/);
        return match ? parseInt(match[1]) : 999;
    }

    createBootstrapHook() {
        this.addHook('bootstrap', async (memoryManager) => {
            // Check if we need bootstrap
            const identityFile = path.join(this.workspaceDir, 'IDENTITY.md');
            const userFile = path.join(this.workspaceDir, 'USER.md');
            
            const needsBootstrap = !fs.existsSync(identityFile) || 
                                 !fs.readFileSync(identityFile, 'utf8').includes('Name:') ||
                                 !fs.existsSync(userFile) ||
                                 !fs.readFileSync(userFile, 'utf8').includes('Name:');
            
            if (needsBootstrap) {
                memoryManager.logEvent('Bootstrap needed - identities not configured', 'bootstrap');
            } else {
                memoryManager.logEvent('Bootstrap complete - identities configured', 'bootstrap');
            }
        }, 1);
    }

    createSessionLoggerHook() {
        this.addHook('session-logger', async (memoryManager) => {
            // Log session start
            memoryManager.logSession('main-session', 'main', new Date());
            memoryManager.logEvent('Session logger initialized', 'system');
        }, 2);
    }

    createMemoryMaintenanceHook() {
        this.addHook('memory-maintenance', async (memoryManager) => {
            // Clean up old memory files older than 30 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            if (fs.existsSync(memoryManager.memoryDir)) {
                const files = fs.readdirSync(memoryManager.memoryDir);
                let deletedCount = 0;
                
                for (const file of files) {
                    if (file.endsWith('.md')) {
                        const filePath = path.join(memoryManager.memoryDir, file);
                        const stats = fs.statSync(filePath);
                        
                        if (stats.mtime < cutoffDate) {
                            fs.unlinkSync(filePath);
                            deletedCount++;
                        }
                    }
                }
                
                if (deletedCount > 0) {
                    memoryManager.logEvent(`Cleaned up ${deletedCount} old memory files`, 'maintenance');
                }
            }
        }, 99); // Low priority
    }
}

module.exports = BootHooks;