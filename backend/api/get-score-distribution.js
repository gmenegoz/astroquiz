/**
 * GET /api/get-score-distribution
 * Returns score distribution data for visualization (chart/histogram)
 */

const { getScoreDistribution } = require('../lib/sheets-client');

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
        const distribution = await getScoreDistribution();

        // Calculate total responses and statistics
        const totalResponses = distribution.reduce((sum, item) => sum + item.count, 0);

        let averageScore = 0;
        if (totalResponses > 0) {
            const totalScore = distribution.reduce((sum, item) => sum + (item.score * item.count), 0);
            averageScore = (totalScore / totalResponses).toFixed(2);
        }

        return res.status(200).json({
            success: true,
            distribution,
            statistics: {
                totalResponses,
                averageScore: parseFloat(averageScore),
            },
        });
    } catch (error) {
        console.error('Error fetching score distribution:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch score distribution',
            message: error.message,
        });
    }
};
