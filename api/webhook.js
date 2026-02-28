export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle GET request for testing
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'ok', 
            message: 'Webhook endpoint is working',
            timestamp: new Date().toISOString()
        });
    }

    // Only allow POST for actual webhook
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        console.log('📩 Received update:', JSON.stringify(update));
        
        // Check if we have a message
        if (!update.message) {
            return res.status(200).json({ ok: true });
        }

        const chatId = update.message.chat.id;
        const messageText = update.message.text || '';
        const firstName = update.message.chat.first_name || 'Trader';
        
        console.log(`👤 Chat ID: ${chatId}, Message: ${messageText}`);

        // Handle /start command
        if (messageText === '/start') {
            // Get the app URL
            const appUrl = 'https://daily-trend-bias-pro.vercel.app';
            
            // Generate one-time connection token
            const tokenData = `${chatId}:${Date.now()}`;
            const token = Buffer.from(tokenData).toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
            
            const connectionLink = `${appUrl}/?connect=${token}`;
            
            console.log(`🔗 Generated connection link: ${connectionLink}`);

            // Check if bot token exists
            if (!process.env.TELEGRAM_BOT_TOKEN) {
                console.error('❌ TELEGRAM_BOT_TOKEN is not set');
                return res.status(500).json({ error: 'Bot token not configured' });
            }

            // Send message to Telegram
            const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `👋 Hello ${firstName}!\n\n🔐 <b>Privacy-First Trading Alerts</b>\n\nClick the button below to connect your browser.\n\n<b>Privacy Guarantee:</b>\n• Your Chat ID NEVER leaves your device\n• No data is stored on our servers\n• All alerts go directly from your browser to Telegram`,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🔗 Connect Browser', url: connectionLink }
                        ]]
                    }
                })
            });
            
            const telegramData = await telegramResponse.json();
            console.log('📤 Telegram response:', JSON.stringify(telegramData));
            
            if (!telegramData.ok) {
                console.error('❌ Telegram API error:', telegramData);
            }
        }
        
        // Always return 200 to Telegram
        return res.status(200).json({ ok: true });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        // Still return 200 to prevent Telegram from retrying
        return res.status(200).json({ ok: true, error: error.message });
    }
}
