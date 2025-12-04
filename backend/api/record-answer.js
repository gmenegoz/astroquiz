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
        const { sessionID, questionID, selectedAnswerText } = req.body;

        // Validate input
        if (!sessionID || !questionID || !selectedAnswerText) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sessionID, questionID, selectedAnswerText',
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

        // Find the original index by matching answer text
        let selectedAnswerIndex = -1;
        for (let i = 0; i < question.answers.length; i++) {
            if (question.answers[i] === selectedAnswerText) {
                selectedAnswerIndex = i;
                break;
            }
        }

        if (selectedAnswerIndex === -1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid answer text',
            });
        }

        // Now selectedAnswerIndex is the ORIGINAL index (0-2) from database
        const isCorrect = selectedAnswerIndex === question.correctIndex;

        // Record the answer and get updated statistics
        const stats = await recordAnswer(questionID, selectedAnswerIndex);

        // Calculate percentage for correct answer
        const correctCount = stats.answerDistribution[question.correctIndex];
        const correctPercentage = ((correctCount / stats.totalResponses) * 100).toFixed(1);

        return res.status(200).json({
            success: true,
            correct: isCorrect,
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
