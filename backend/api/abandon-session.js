/**
 * POST /api/abandon-session
 * Marks a session as abandoned (user left without completing)
 */

const { abandonSession } = require('../lib/sheets-client');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sessionID } = req.body;

        // Validate input
        if (!sessionID) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: sessionID',
            });
        }

        await abandonSession(sessionID);

        return res.status(200).json({
            success: true,
            sessionID,
            status: 'abandoned',
        });
    } catch (error) {
        console.error('Error abandoning session:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to abandon session',
            message: error.message,
        });
    }
};
