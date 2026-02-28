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
            
const welcomeMessage = `👋 <b>Welcome to Trading Bias Bot, ${firstName}!</b>

🔐 <b>Privacy First:</b> Your Chat ID is stored ONLY on your device.

📊 <b>What This Bot Does:</b>
• Monitors 8 trading pairs (PAXG, BTC, ETH, XAG, JPY, EUR, CAD, GBP)
• Sends alerts when price touches the EMA (Exponential Moving Average)
• You control the sensitivity with a threshold setting

🚀 <b>How to Get Started:</b>

<b>STEP 1:</b> Click the button below 👇 to connect your browser
<b>STEP 2:</b> The app will open and automatically connect
<b>STEP 3:</b> Customize your settings in the web app:
   • Choose your trading pair
   • Adjust the EMA period (default: 350)
   • Set the alert threshold (default: 0.1%)
   • Select timeframe (1m, 5m, 15m, 1h, 1d)

<b>STEP 4:</b> Wait for alerts! You'll receive messages when price touches the EMA.

⚙️ <b>Settings Explained:</b>
• <b>EMA Period:</b> Higher = smoother line, slower signals
• <b>Threshold:</b> Lower = more precise touches, Higher = more alerts
• <b>Cooldown:</b> Prevents alert spam

❓ <b>Need Help?</b>
• Use /help for commands
• Use /settings for current settings
• Use /privacy for privacy info

Happy Trading! 📈`;

const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔗 CONNECT BROWSER', url: connectionLink }
                ],
                [
                    { text: '📊 View Dashboard', url: appUrl },
                    { text: '⚙️ Settings Guide', url: `${appUrl}/#settings` }
                ],
                [
                    { text: '❓ Help', callback_data: 'help' },
                    { text: '🔐 Privacy', callback_data: 'privacy' }
                ]
            ]
        }
    })
});



            
           // const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              //  method: 'POST',
             //   headers: { 'Content-Type': 'application/json' },
             //   body: JSON.stringify({
                  //  chat_id: chatId,
                 //   text: `👋 Hello ${firstName}!\n\n🔐 <b>Privacy-First Trading Alerts</b>\n\nClick the button below to connect your browser.\n\n<b>Privacy Guarantee:</b>\n• Your Chat ID NEVER leaves your device\n• No data is stored on our servers\n• All alerts go directly from your browser to Telegram`,
                  //  parse_mode: 'HTML',
                  //  reply_markup: {
                      //  inline_keyboard: [[
                         //   { text: '🔗 Connect Browser', url: connectionLink }
                      //  ]]
                  //  }
            //    })
           // });
            
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
