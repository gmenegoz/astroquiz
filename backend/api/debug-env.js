/**
 * GET /api/debug-env
 * Debug endpoint to check environment variables (DO NOT use in production!)
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

    // Check if service account JSON exists and is valid
    let serviceAccountStatus = 'NOT_SET';
    let serviceAccountEmail = null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        try {
            const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            serviceAccountStatus = 'VALID_JSON';
            serviceAccountEmail = parsed.client_email || 'EMAIL_NOT_FOUND';
        } catch (error) {
            serviceAccountStatus = 'INVALID_JSON: ' + error.message;
        }
    }

    return res.status(200).json({
        success: true,
        message: 'Environment variables debug info',
        timestamp: new Date().toISOString(),
        environment: {
            VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
            VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
            NODE_VERSION: process.version,
        },
        config: {
            GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || 'NOT_SET',
            GOOGLE_SERVICE_ACCOUNT_JSON_STATUS: serviceAccountStatus,
            SERVICE_ACCOUNT_EMAIL: serviceAccountEmail,
            SHEET_QUESTIONS: process.env.SHEET_QUESTIONS || 'questions (default)',
            SHEET_SESSIONS: process.env.SHEET_SESSIONS || 'sessions (default)',
            SHEET_ANSWER_STATS: process.env.SHEET_ANSWER_STATS || 'answer_stats (default)',
            SHEET_SCORE_DISTRIBUTION: process.env.SHEET_SCORE_DISTRIBUTION || 'score_distribution (default)',
        },
        warnings: [
            '⚠️  This endpoint exposes sensitive configuration info!',
            '⚠️  Remove this endpoint before production deployment!',
        ],
    });
};
