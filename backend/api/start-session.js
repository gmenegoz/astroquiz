/**
 * POST /api/start-session
 * Creates a new quiz session and returns sessionID
 */

const { v4: uuidv4 } = require('uuid');
const { createSession } = require('../lib/sheets-client');

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
        const sessionID = uuidv4();
        const timestamp = new Date().toISOString();

        await createSession(sessionID, timestamp);

        return res.status(200).json({
            success: true,
            sessionID,
            timestamp,
        });
    } catch (error) {
        console.error('Error creating session:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create session',
            message: error.message,
        });
    }
};
