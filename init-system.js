#!/usr/bin/env node

/**
 * Bootstrap and Initialize System
 * 
 * This script sets up the boot hooks, memory system, and session logger
 * for the OpenClaw workspace.
 */

const fs = require('fs');
const path = require('path');

// Add current directory to require path
const currentDir = __dirname;
process.chdir(currentDir);

console.log('🚀 Initializing OpenClaw System...');
console.log('=====================================');

// Check if we have the required files
const requiredFiles = [
    'memory-manager.js',
    'boot-hooks.js', 
    'system-logger.js',
    'boot-init.js'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing required file: ${file}`);
        process.exit(1);
    }
    console.log(`✅ Found: ${file}`);
}

// Initialize the system
console.log('\n🧠 Initializing memory system...');
const MemoryManager = require('./memory-manager');
const memoryManager = new MemoryManager(__dirname);
memoryManager.logEvent('System initialization started', 'system');

console.log('🪝 Setting up boot hooks...');
const BootHooks = require('./boot-hooks');
const bootHooks = new BootHooks(__dirname);

// Create essential hooks
bootHooks.createBootstrapHook();
bootHooks.createSessionLoggerHook();
bootHooks.createMemoryMaintenanceHook();

console.log('📊 Setting up system logger...');
const SystemLogger = require('./system-logger');
const systemLogger = new SystemLogger(__dirname);

systemLogger.info('System initialization started');

// Run startup hooks
console.log('\n🔄 Running startup hooks...');
bootHooks.runHooks('startup')
    .then(() => {
        console.log('✅ Boot hooks completed successfully');
        systemLogger.info('Boot hooks completed successfully');
        memoryManager.logEvent('System initialization complete', 'system');
        
        console.log('\n🎉 System successfully initialized!');
        console.log('=====================================');
        console.log('📂 Memory directory: ./memory');
        console.log('📂 Logs directory: ./logs'); 
        console.log('🪝 Boot hooks directory: ./boot-hooks');
        console.log('📝 Session logger: active');
        console.log('🧠 Memory manager: active');
        console.log('📊 System logger: active');
        
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Boot hook error:', error.message);
        systemLogger.error(`Boot error: ${error.message}`);
        memoryManager.logEvent(`System initialization error: ${error.message}`, 'error');
        
        process.exit(1);
    });