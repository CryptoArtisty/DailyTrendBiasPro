export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { token } = req.query;
        
        // Check if token is provided
        if (!token) {
            return res.status(400).json({ 
                valid: false, 
                error: 'Token required' 
            });
        }
        
        // Validate token format
        try {
            // Restore base64 (reverse the URL-safe replacements)
            const base64 = token
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            
            // Add padding if needed
            const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
            
            // Decode token
            const decoded = Buffer.from(paddedBase64, 'base64').toString();
            
            // Check format: should contain chatId:timestamp
            if (!decoded.includes(':')) {
                return res.status(400).json({ 
                    valid: false, 
                    error: 'Invalid token format' 
                });
            }
            
            const [chatId, timestamp] = decoded.split(':');
            
            // Validate timestamp exists and is a number
            if (!chatId || !timestamp || isNaN(parseInt(timestamp))) {
                return res.status(400).json({ 
                    valid: false, 
                    error: 'Invalid token data' 
                });
            }
            
            // Check if token is expired (5 minutes = 300000 ms)
            const tokenAge = Date.now() - parseInt(timestamp);
            const isValid = tokenAge < 300000; // 5 minutes
            
            // Calculate time remaining if valid
            const timeRemaining = isValid ? Math.max(0, 300000 - tokenAge) : 0;
            
            return res.status(200).json({ 
                valid: isValid,
                expiresIn: Math.floor(timeRemaining / 1000), // Convert to seconds
                message: isValid ? 'Token is valid' : 'Token has expired',
                // IMPORTANT: Never return the actual chatId!
                // This endpoint only validates, doesn't expose user data
            });
            
        } catch (e) {
            console.error('Token decoding error:', e);
            return res.status(400).json({ 
                valid: false, 
                error: 'Invalid token' 
            });
        }
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            valid: false, 
            error: 'Internal server error' 
        });
    }
}
