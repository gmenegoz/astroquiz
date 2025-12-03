/**
 * POST /api/complete-session
 * Marks a session as completed and updates score distribution
 */

const { completeSession, updateScoreDistribution } = require('../lib/sheets-client');

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
        const { sessionID, finalScore, totalQuestions } = req.body;

        // Validate input
        if (!sessionID || finalScore === undefined || !totalQuestions) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sessionID, finalScore, totalQuestions',
            });
        }

        if (finalScore < 0 || finalScore > totalQuestions) {
            return res.status(400).json({
                success: false,
                error: 'Invalid score range',
            });
        }

        const timestampEnd = new Date().toISOString();
        const percentage = ((finalScore / totalQuestions) * 100).toFixed(2);

        // Update session
        await completeSession(sessionID, timestampEnd, finalScore, totalQuestions);

        // Update score distribution
        await updateScoreDistribution(finalScore);

        return res.status(200).json({
            success: true,
            sessionID,
            finalScore,
            totalQuestions,
            percentage: parseFloat(percentage),
            timestamp: timestampEnd,
        });
    } catch (error) {
        console.error('Error completing session:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to complete session',
            message: error.message,
        });
    }
};
