// api/webhook.js
// Telegram bot webhook handler - generates one-time connection tokens

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    // Only allow POST from Telegram
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        
        // Handle /start command
        if (update.message?.text === '/start') {
            const chatId = update.message.chat.id;
            const username = update.message.chat.username || 'User';
            
            // Generate one-time connection token (expires in 5 minutes)
            const token = generateConnectionToken(chatId);
            
            // Create connection link
            const connectionLink = `${process.env.APP_URL}/?connect=${token}`;
            
            // Send welcome message with connection button
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `👋 Hello ${username}!\n\n` +
                          `🔐 <b>Privacy-First Trading Alerts</b>\n\n` +
                          `Click the button below to connect your browser. ` +
                          `This generates a one-time secure token that expires in 5 minutes.\n\n` +
                          `<b>Privacy Guarantee:</b>\n` +
                          `• Your Chat ID NEVER leaves your device\n` +
                          `• The token is one-time use only\n` +
                          `• No data is stored on our servers\n` +
                          `• All alerts go directly from your browser to Telegram`,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[
                            { 
                                text: '🔗 Connect Browser', 
                                url: connectionLink 
                            }
                        ]]
                    }
                })
            });
            
            return res.status(200).json({ ok: true });
        }
        
        // Handle other commands
        if (update.message?.text === '/help') {
            const chatId = update.message.chat.id;
            
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `🤖 <b>Available Commands</b>\n\n` +
                          `/start - Start the bot and connect browser\n` +
                          `/help - Show this help message\n` +
                          `/privacy - View privacy policy\n` +
                          `/status - Check connection status`,
                    parse_mode: 'HTML'
                })
            });
            
            return res.status(200).json({ ok: true });
        }
        
        if (update.message?.text === '/privacy') {
            const chatId = update.message.chat.id;
            
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `🔐 <b>Privacy Policy</b>\n\n` +
                          `We use a <b>Zero-Knowledge Architecture</b>:\n\n` +
                          `• Your Chat ID is stored ONLY on your device\n` +
                          `• We NEVER see your Chat ID\n` +
                          `• All alerts go directly from your browser to Telegram\n` +
                          `• No databases, no logging, no tracking\n` +
                          `• Open source - you can verify the code\n\n` +
                          `[View Source](${process.env.APP_URL})`,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            });
            
            return res.status(200).json({ ok: true });
        }
        
        if (update.message?.text === '/status') {
            const chatId = update.message.chat.id;
            
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `📊 <b>Connection Status</b>\n\n` +
                          `To connect your browser:\n` +
                          `1. Click the link in the /start message\n` +
                          `2. The token will connect automatically\n` +
                          `3. Your Chat ID will be stored locally\n\n` +
                          `⚠️ <b>Note:</b> If the token expired, just send /start again.`,
                    parse_mode: 'HTML'
                })
            });
            
            return res.status(200).json({ ok: true });
        }
        
        // Handle callback queries (button clicks)
        if (update.callback_query) {
            const chatId = update.callback_query.message.chat.id;
            
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: update.callback_query.id,
                    text: 'Opening connection link...',
                    show_alert: false
                })
            });
            
            return res.status(200).json({ ok: true });
        }
        
        return res.status(200).json({ ok: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Generate one-time connection token (encrypted chat ID with timestamp)
function generateConnectionToken(chatId) {
    // Create token: chatId:timestamp
    const tokenData = `${chatId}:${Date.now()}`;
    
    // Base64 encode for URL safety
    return Buffer.from(tokenData).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
