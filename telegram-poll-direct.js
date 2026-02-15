#!/usr/bin/env node

const token = '8574855644:AAFu09TXtAsHG6pdLc8iGVerucjUEWTq0XM';
const chatId = '8458183679';
const apiBase = `https://api.telegram.org/bot${token}`;

let lastUpdateId = 0;

function getUpdates() {
    const url = `${apiBase}/getUpdates?offset=${lastUpdateId}&limit=1&timeout=5`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.result && data.result.length > 0) {
                data.result.forEach(update => {
                    lastUpdateId = update.update_id + 1;

                    if (update.message) {
                        const msg = update.message;
                        const text = msg.text;
                        const chatId = msg.chat.id;
                        const messageId = msg.message_id;

                        console.log(`\n📩 Pesan Baru (ID: ${messageId}):`);
                        console.log(`💬 "${text}"`);
                        console.log(`📍 Chat ID: ${chatId}`);
                        console.log(`⏰ ${new Date().toLocaleTimeString()}`);
                        console.log('-----------------------------------');

                        // Auto-reply
                        fetch(`${apiBase}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: `🤖 Saya terima pesan: "${text}"`
                            })
                        })
                        .then(response => response.json())
                        .then(replyData => {
                            if (replyData.ok) {
                                console.log('✅ Pesan balasan terkirim');
                            } else {
                                console.log('❌ Gagal balas:', replyData.description);
                            }
                        })
                        .catch(err => console.log('❌ Error kirim balasan:', err.message));
                    }
                });
            }
        })
        .catch(error => {
            console.log('❌ Error checking updates:', error.message);
        });
}

// Initial check
getUpdates();

// Poll every 7 seconds
setInterval(getUpdates, 7000);

console.log('🤖 Telegram Bot Polling Started!');
console.log(`📡 Checking updates every 7 seconds...`);
console.log(`📍 Chat ID: ${chatId}`);
console.log('💡 Ketik Ctrl+C untuk berhenti');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping polling...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping polling...');
    process.exit(0);
});