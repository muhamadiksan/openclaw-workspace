const fs = require('fs');
const path = require('path');

class MemoryManager {
    constructor(workspaceDir = '/root/.openclaw/workspace') {
        this.workspaceDir = workspaceDir;
        this.memoryDir = path.join(workspaceDir, 'memory');
        this.ensureMemoryDirectory();
    }

    ensureMemoryDirectory() {
        if (!fs.existsSync(this.memoryDir)) {
            fs.mkdirSync(this.memoryDir, { recursive: true });
        }
    }

    getTodayMemoryFile() {
        const today = new Date().toISOString().split('T')[0];
        const todayFile = path.join(this.memoryDir, `${today}.md`);
        
        if (!fs.existsSync(todayFile)) {
            const content = `# Memory - ${today}\n\n## Today's Sessions\n\n## Events\n\n## Decisions\n\n## Notes\n\n`;
            fs.writeFileSync(todayFile, content);
        }
        
        return todayFile;
    }

    logSession(sessionKey, sessionType = 'main', startTime = new Date()) {
        const todayFile = this.getTodayMemoryFile();
        const sessionLog = `\n## Session - ${sessionKey} (${sessionType})\n- Started: ${startTime.toISOString()}\n- Status: Active\n\n`;
        
        fs.appendFileSync(todayFile, sessionLog);
    }

    logSessionEnd(sessionKey, endTime = new Date()) {
        const todayFile = this.getTodayMemoryFile();
        const logEntry = `## Session - ${sessionKey}\n- Status: Completed\n- Ended: ${endTime.toISOString()}\n\n`;
        
        fs.appendFileSync(todayFile, logEntry);
    }

    logEvent(event, category = 'general') {
        const todayFile = this.getTodayMemoryFile();
        const timestamp = new Date().toISOString();
        const logEntry = `\n### ${category} - ${timestamp}\n${event}\n\n`;
        
        fs.appendFileSync(todayFile, logEntry);
    }

    updateMemory(memoryText, category = 'memory') {
        const todayFile = this.getTodayMemoryFile();
        const timestamp = new Date().toISOString();
        const memoryEntry = `\n### ${category} - ${timestamp}\n${memoryText}\n\n`;
        
        fs.appendFileSync(todayFile, memoryEntry);
    }

    searchMemory(query) {
        if (!fs.existsSync(this.memoryDir)) {
            return [];
        }

        const files = fs.readdirSync(this.memoryDir).filter(file => file.endsWith('.md'));
        const results = [];

        for (const file of files) {
            const filePath = path.join(this.memoryDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    file: file,
                    content: content,
                    lines: content.split('\n').length
                });
            }
        }

        return results;
    }
}

module.exports = MemoryManager;