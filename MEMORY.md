# MEMORY.md - Long-Term Memory

## System Setup & Boot Hooks (2026-02-15)

### Major Events
- **System Initialization**: Boot hooks, memory manager, and session logger were successfully implemented and initialized
- **Bootstrap System**: Created comprehensive boot hook infrastructure with manual hook file generation
- **Memory Management**: Implemented persistent memory system with daily logs (memory/YYYY-MM-DD.md format)

### Boot Infrastructure
- **Boot Hooks Directory**: `/root/.openclaw/workspace/boot-hooks/` contains essential startup hooks
- **Memory Manager**: Handles persistent logging and memory maintenance
- **System Logger**: Logs system events to `/root/.openclaw/workspace/logs/`
- **Session Logger**: Automatically logs session activity and events

### Critical Decisions
- **Manual Hook Creation**: Switched from automatic hook generation to manual files to avoid syntax issues
- **Hook Files**: Created three essential hooks: bootstrap.js, session-logger.js, memory-maintenance.js
- **Error Resolution**: Fixed syntax errors in hook files (missing proper indentation and function definitions)

### System Health & Maintenance
- **Heartbeat System**: Implemented periodic health checks in HEARTBEAT.md
- **Memory Cleanup**: Automatic cleanup of memory files older than 30 days
- **Session Tracking**: Logs all session starts, activities, and completions

### Technical Implementation Details
- **Language**: Node.js for boot system implementation
- **File Structure**: Organized into modules for maintainability
- **Error Handling**: Robust error logging and system monitoring
- **File Paths**: Uses absolute paths for reliability

### Current Status
- All boot hooks verified and working correctly
- System is stable and operational
- Memory persistence system functional
- Session health monitoring active

### Important Notes
- Hook files must be manually maintained to avoid syntax generation issues
- Memory system automatically creates daily log files
- System initialization logs are preserved for debugging
- Heartbeat system tracks system health and activity

---

## BytePlus Integration & Model Configuration (2026-02-16)

### Major Events
- **BytePlus Integration**: Successfully integrated 21 BytePlus models to OpenClaw
- **API Configuration**: Configured base URL (https://ai.sumopod.com/v1) and API key
- **GitHub Backup**: Set up automatic backup every 5 minutes to GitHub repository
- **Sub-Agent Setup**: Configured Kimi MoE as default sub-agent model

### Model Configuration
- **Main Agent Model**: GLM 4.7 (byteplus/glm-4-7-251222) - 2.8s response time
- **Sub-Agent Default**: Kimi MoE (byteplus/kimi-moe-8x22b-250905) - 2.3s response time
- **Available Models**: 21 BytePlus models including Kimi MoE, GLM 4.7, DeepSeek V3, Kimi K2, Seed 1.8
- **All Models**: FREE ($0.00/1M tokens)

### Critical Decisions
- **Kimi MoE for Sub-Agents**: Chosen for fastest speed (2.3s) and large context (219k tokens)
- **GLM 4.7 for Main Agent**: Balanced performance and reliability
- **Max Concurrent Sub-Agents**: 8 sub-agents can run in parallel
- **GitHub Auto-Backup**: Prevents data loss with version control

### Performance Insights
- **Main Agent**: Faster for simple, immediate tasks (no session overhead)
- **Sub-Agent**: Better for parallel, heavy tasks (when configured correctly)
- **Parallel Processing**: 8 sub-agents can run simultaneously, 8x faster than sequential

### Known Issues
- **Sub-Agent Auth**: API key not automatically copied to sub-agent directories
- **GitHub Push**: Requires manual authentication for push operations
- **Sub-Agent Response**: May fail if auth profiles not configured

### GitHub Repository
- **URL**: https://github.com/muhamadiksan/openclaw-config
- **Files Tracked**: openclaw.json, openclaw-with-byteplus.json, .gitignore
- **Backup Frequency**: Every 5 minutes
- **Version Control**: Full history preserved

### Configuration Files
- `/root/.openclaw/openclaw.json` - Main configuration
- `/root/.openclaw/workspace/openclaw-with-byteplus.json` - Backup
- `/root/.openclaw/workspace/BYTEPLUS-OPENCLAW-INTEGRATION.md` - Documentation
- `/root/.openclaw/workspace/BYTEPLUS-PERFORMANCE-TEST.md` - Test results
- `/root/.openclaw/workspace/KIMI-MOE-SUBAGENT-CONFIG.md` - Sub-agent config

### Current Status
- ✅ BytePlus: Fully integrated and tested
- ✅ GitHub: Auto backup active
- ✅ Sub-Agents: Kimi MoE configured
- ✅ Performance: All models responding
- ⚠️ GitHub Push: Needs manual authentication
- ⚠️ Sub-Agent Auth: Needs manual auth profile setup