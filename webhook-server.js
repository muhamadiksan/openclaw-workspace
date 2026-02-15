const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// Webhook endpoint untuk Telegram
app.post('/webhook', (req, res) => {
    console.log('📥 Telegram Webhook Received:', JSON.stringify(req.body, null, 2));

    // Cek update type
    if (req.body.message) {
        console.log('📩 Pesan diterima:', req.body.message);
    } else if (req.body.edited_message) {
        console.log('✏️ Pesan diedit:', req.body.edited_message);
    } else if (req.body.callback_query) {
        console.log('🔘 Callback query:', req.body.callback_query);
    }

    // Send 200 OK response
    res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
    console.log(`📡 Endpoint: http://<YOUR-VPS-IP>:${PORT}/webhook`);
    console.log(`💚 Health: http://<YOUR-VPS-IP>:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down webhook server...');
    process.exit(0);
});

module.exports = app;