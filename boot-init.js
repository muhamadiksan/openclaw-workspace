const BootHooks = require('./boot-hooks');
const MemoryManager = require('./memory-manager');

// Initialize the boot system
const bootHooks = new BootHooks();
const memoryManager = new MemoryManager();

// Create essential hooks
bootHooks.createBootstrapHook();
bootHooks.createSessionLoggerHook();
bootHooks.createMemoryMaintenanceHook();

// Run startup hooks
console.log('Running boot hooks...');
bootHooks.runHooks('startup').then(() => {
    console.log('Boot hooks completed successfully');
    memoryManager.logEvent('System boot complete', 'system');
}).catch(error => {
    console.error('Boot hook error:', error);
    memoryManager.logEvent(`Boot error: ${error.message}`, 'error');
});

// Export for use in other modules
module.exports = {
    BootHooks,
    MemoryManager,
    bootHooks,
    memoryManager
};