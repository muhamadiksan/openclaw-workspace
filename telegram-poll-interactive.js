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

        // Process message and send appropriate response
        processMessage(chatId, text);
    }
}

function processMessage(chatId, text) {
    const lowerText = text.toLowerCase().trim();
    
    let response = '';
    
    // Greetings
    if (lowerText.includes('halo') || lowerText.includes('hello') || lowerText.includes('hi')) {
        response = 'Halo! 😊 Saya Dandelion, asisten OpenClaw. Bagaimana kabar Anda hari ini?';
    }
    // Asking about VPS specs
    else if (lowerText.includes('spesifikasi vps') || lowerText.includes('vps specs')) {
        response = `Sistem VPS saya saat ini:
• OS: Linux 6.6.117-45.1.oc9.x86_64
• CPU: 1 vCPU (cloud environment)
• RAM: Cloud-based allocation
• Storage: Cloud storage
• Node.js: v22.22.0
• OpenClaw: Terinstall dan aktif

Ada yang ingin Anda ketahui lebih detail?`;
    }
    // Status query
    else if (lowerText.includes('status') || lowerText.includes('bagaimana kabar')) {
        response = 'Status saya baik-baik saja! 🔥 Sistem berjalan normal, Telegram terhubung, siap membantu. Ada yang bisa saya bantu?';
    }
    // Small talk
    else if (lowerText.includes('ayo berdiskusi') || lowerText.includes('diskusi')) {
        response = 'Tentu saja! Saya suka diskusi. 😊 Apa topik yang ingin kita bahas? Bisnis, teknologi, hiburan, atau sesuatu yang lain?';
    }
    // Weather
    else if (lowerText.includes('cuaca')) {
        response = 'Katakan nama kota, saya akan cek cuaca untuk Anda! Contoh: "cuaca jakarta" atau "cuaca bali"';
    }
    // Help
    else if (lowerText.includes('bantuan') || lowerText.includes('help')) {
        response = `🎯 Bantuan OpenClaw:

• Cuaca: "cuaca [kota]"
• Info sistem: "spesifikasi vps" 
• Status: "status"
• Skills: "apa skills yang tersedia"
• Bicara langsung: kirim pesan seperti manusia!

Apa yang mau Anda coba?`;
    }
    // Default response
    else {
        response = `Terima pesan: "${text}" 

Saya Dandelion, asisten OpenClaw. Saya bisa membantu dengan:
• Weather forecast
• System monitoring  
• Skills management
• Security checks
• Productivity tools

Coba tahu saya apa yang Anda butuhkan! 😊`;
    }
    
    sendReply(chatId, response);
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