/**
 * POST /api/record-answer
 * Records user's answer and returns statistics
 */

const { recordAnswer, getQuestions } = require('../lib/sheets-client');

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
        const { sessionID, questionID, selectedAnswerIndex } = req.body;

        // Validate input
        if (!sessionID || !questionID || selectedAnswerIndex === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sessionID, questionID, selectedAnswerIndex',
            });
        }

        if (selectedAnswerIndex < 0 || selectedAnswerIndex > 2) {
            return res.status(400).json({
                success: false,
                error: 'selectedAnswerIndex must be 0, 1, or 2',
            });
        }

        // Get question details to determine correct answer
        const questions = await getQuestions();
        const question = questions.find(q => q.id === questionID);

        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found',
            });
        }

        // Record the answer and get updated statistics
        const stats = await recordAnswer(questionID, selectedAnswerIndex);

        // Calculate percentage for correct answer
        const correctCount = stats.answerDistribution[question.correctIndex];
        const correctPercentage = ((correctCount / stats.totalResponses) * 100).toFixed(1);

        return res.status(200).json({
            success: true,
            correct: selectedAnswerIndex === question.correctIndex,
            correctAnswerIndex: question.correctIndex,
            statistics: {
                totalResponses: stats.totalResponses,
                correctPercentage: parseFloat(correctPercentage),
                answerDistribution: stats.answerDistribution,
            },
        });
    } catch (error) {
        console.error('Error recording answer:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to record answer',
            message: error.message,
        });
    }
};
