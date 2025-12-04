/**
 * GET /api/health
 * Simple health check endpoint to verify deployment is working
 */

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(200).json({
        success: true,
        message: 'AstroQuiz Backend API is running! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL_ENV || 'development',
        region: process.env.VERCEL_REGION || 'unknown',
    });
};
