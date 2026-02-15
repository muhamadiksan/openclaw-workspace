const TelegramBot = require('node-telegram-bot-api');

const token = '8574855644:AAFu09TXtAsHG6pdLc8iGVerucjUEWTq0XM';
const chatId = '8458183679';

// Create bot instance with polling starting from update_id=0
const bot = new TelegramBot(token, { polling: { start_param: 'mybot' } });

console.log('🤖 Telegram Bot Polling Started!');
console.log(`📡 Checking updates starting from offset: 0`);
console.log(`📍 Chat ID: ${chatId}`);
console.log('-----------------------------------');

let updateId = 0;

function checkForUpdates() {
    if (updateId === 0) {
        // First check without offset
        bot.getUpdates()
            .then((updates) => {
                if (updates.length > 0) {
                    updateId = updates[updates.length - 1].update_id + 1;
                    processUpdates(updates);
                }
            })
            .catch((error) => {
                console.log('❌ Error checking updates:', error.message);
            });
    } else {
        // Subsequent checks with offset
        bot.getUpdates({ offset: updateId, limit: 1, timeout: 5 })
            .then((updates) => {
                if (updates.length > 0) {
                    processUpdates(updates);
                }
            })
            .catch((error) => {
                console.log('❌ Error checking updates:', error.message);
            });
    }
}

function processUpdates(updates) {
    updates.forEach((update) => {
        updateId = update.update_id + 1;

        if (update.message) {
            const msg = update.message;
            const text = msg.text;
            const chatId = msg.chat.id;
            const messageId = msg.message_id;

            console.log(`\n📩 Pesan Baru (ID: ${messageId}):`);
            console.log(`💬 ${text}`);
            console.log(`📍 Chat ID: ${chatId}`);
            console.log(`⏰ ${new Date().toLocaleTimeString()}`);
            console.log('-----------------------------------');

            // Auto-reply message
            bot.sendMessage(chatId, `🤖 Saya terima pesan: "${text}"`)
                .then(() => {
                    console.log('✅ Pesan balasan terkirim');
                })
                .catch((err) => {
                    console.log('❌ Gagal mengirim balasan:', err.message);
                });
        }
    });
}

// Initial check
checkForUpdates();

// Poll every 7 seconds
setInterval(checkForUpdates, 7000);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping polling...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping polling...');
    bot.stopPolling();
    process.exit(0);
});

console.log('💡 Ketik Ctrl+C untuk berhenti');