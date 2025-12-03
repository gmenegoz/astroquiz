/**
 * GET /api/get-questions
 * Returns all quiz questions from Google Sheets
 */

const { getQuestions } = require('../lib/sheets-client');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
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

    try {
        const questions = await getQuestions();

        return res.status(200).json({
            success: true,
            questions,
            total: questions.length,
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch questions',
            message: error.message,
        });
    }
};
