const token = '8574855644:AAGqgkxEh6c1bsEHF7s0mX6gY9Xi1QP5h18';
const chatId = '8458183679';
const apiBase = `https://api.telegram.org/bot${token}`;

let lastUpdateId = 0;
let pollingInterval;

function startPolling() {
    console.log('🤖 Telegram Bot Polling Dimulai!');
    console.log(`📡 Checking updates every 7 seconds...`);
    console.log(`📍 Chat ID: ${chatId}`);
    
    pollingInterval = setInterval(getUpdates, 7000);
    getUpdates(); // Initial check
}

function getUpdates() {
    const url = `${apiBase}/getUpdates?offset=${lastUpdateId}&limit=1&timeout=5`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.result && data.result.length > 0) {
                data.result.forEach(update => {
                    lastUpdateId = update.update_id + 1;
                    handleMessage(update);
                });
            }
        })
        .catch(error => {
            console.log('❌ Error checking updates:', error.message);
        });
}

function handleMessage(update) {
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
        sendReply(chatId, `🤖 Saya terima pesan: "${text}"`);
    }
}

function sendReply(chatId, text) {
    fetch(`${apiBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log('✅ Pesan balasan terkirim');
        } else {
            console.log('❌ Gagal balas:', data.description);
        }
    })
    .catch(err => console.log('❌ Error kirim balasan:', err.message));
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    console.log('🛑 Polling dihentikan');
}

// Graceful shutdown
process.on('SIGINT', () => {
    stopPolling();
    console.log('\n⏹️ Bot berhenti');
    process.exit(0);
});

process.on('SIGTERM', () => {
    stopPolling();
    console.log('\n⏹️ Bot berhenti');
    process.exit(0);
});

startPolling();
console.log('💡 Ketik Ctrl+C untuk berhenti');