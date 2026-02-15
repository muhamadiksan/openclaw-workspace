const fs = require('fs');
const path = require('path');

async function memoryMaintenanceHook(memoryManager, workspaceDir = '/root/.openclaw/workspace') {
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
}

module.exports = { run: memoryMaintenanceHook };