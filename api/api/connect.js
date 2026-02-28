// api/connect.js
// Optional: Validate tokens without storing them
// This only checks token format, never stores chat IDs

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({ error: 'Token required' });
        }
        
        // Validate token format (but don't decode/store)
        try {
            // Restore base64
            const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = Buffer.from(base64, 'base64').toString();
            
            // Check format: should contain chatId:timestamp
            if (!decoded.includes(':')) {
                return res.status(400).json({ valid: false });
            }
            
            const [chatId, timestamp] = decoded.split(':');
            
            // Validate timestamp (token expires after 5 minutes)
            const tokenAge = Date.now() - parseInt(timestamp);
            const isValid = tokenAge < 300000; // 5 minutes
            
            return res.status(200).json({ 
                valid: isValid,
                // Never return the chat ID!
                expiresIn: isValid ? Math.max(0, 300000 - tokenAge) : 0
            });
            
        } catch (e) {
            return res.status(400).json({ valid: false });
        }
        
    } catch (error) {
        return res.status(500).json({ error: 'Internal error' });
    }
}
