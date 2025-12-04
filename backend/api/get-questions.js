/**
 * GET /api/get-questions
 * Returns all quiz questions from Google Sheets
 * Includes 5-minute caching to improve performance
 */

const { getQuestions } = require('../lib/sheets-client');

// In-memory cache
let questionsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
        // Check cache first
        const now = Date.now();
        if (questionsCache && (now - cacheTimestamp) < CACHE_TTL) {
            return res.status(200).json({
                success: true,
                questions: questionsCache,
                total: questionsCache.length,
                cached: true,
            });
        }

        // Fetch from sheets if cache miss
        const questions = await getQuestions();

        // Update cache
        questionsCache = questions;
        cacheTimestamp = now;

        return res.status(200).json({
            success: true,
            questions,
            total: questions.length,
            cached: false,
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
