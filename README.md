# DailyTrendBiasPro
Trading bias app
# Trading Bias Messenger - Privacy-First Edition

A zero-knowledge trading bias alert tool with Telegram alerts. Your Chat ID **never leaves your device**.

## 🔐 Privacy Architecture

- **Zero-Knowledge**: Your Chat ID is stored ONLY in your browser's localStorage
- **No Server Storage**: We never see or store your Chat ID
- **Direct Communication**: Alerts go directly from your browser to Telegram
- **One-Time Tokens**: Connection uses expiring tokens, not permanent IDs
- **Open Source**: Verify the code yourself

## 🚀 Quick Start

### 1. Create Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow instructions
3. Save the bot token

### 2. Deploy to Vercel

```bash
# Clone and install
git clone <your-repo>
cd trading-bias-messenger
npm install

# Deploy
vercel --prod
