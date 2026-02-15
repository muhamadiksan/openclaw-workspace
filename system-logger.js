const fs = require('fs');
const path = require('path');

class SystemLogger {
    constructor(workspaceDir = '/root/.openclaw/workspace') {
        this.workspaceDir = workspaceDir;
        this.logDir = path.join(workspaceDir, 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTodayLogFile() {
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `system-${today}.log`);
        
        if (!fs.existsSync(logFile)) {
            const header = `# System Log - ${today}\n\n`;
            fs.writeFileSync(logFile, header);
        }
        
        return logFile;
    }

    log(level, message, category = 'system') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}\n`;
        
        const logFile = this.getTodayLogFile();
        fs.appendFileSync(logFile, logEntry);
        
        // Also log to memory if it's important
        if (level === 'ERROR' || level === 'WARN' || category === 'memory') {
            const MemoryManager = require('./memory-manager');
            const memoryManager = new MemoryManager(this.workspaceDir);
            memoryManager.logEvent(`[${level}] ${message}`, category);
        }
    }

    info(message, category = 'system') {
        this.log('info', message, category);
    }

    warn(message, category = 'system') {
        this.log('warn', message, category);
    }

    error(message, category = 'system') {
        this.log('error', message, category);
    }

    debug(message, category = 'system') {
        this.log('debug', message, category);
    }

    getRecentLogs(level = null, category = null, lines = 100) {
        const todayFile = this.getTodayLogFile();
        
        if (!fs.existsSync(todayFile)) {
            return [];
        }

        const content = fs.readFileSync(todayFile, 'utf8');
        const logLines = content.split('\n').filter(line => line.trim());
        
        let filteredLogs = logLines;
        
        if (level) {
            filteredLogs = filteredLogs.filter(line => 
                line.includes(`[${level.toUpperCase()}]`)
            );
        }
        
        if (category) {
            filteredLogs = filteredLogs.filter(line => 
                line.includes(`[${category.toUpperCase()}]`)
            );
        }
        
        return filteredLogs.slice(-lines);
    }
}

module.exports = SystemLogger;