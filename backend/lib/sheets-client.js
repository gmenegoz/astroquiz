/**
 * Google Sheets Client Library
 * Handles authentication and operations with Google Sheets API using Service Account
 */

const { google } = require('googleapis');

// Sheet names from environment variables
const SHEET_QUESTIONS = process.env.SHEET_QUESTIONS || 'questions';
const SHEET_SESSIONS = process.env.SHEET_SESSIONS || 'sessions';
const SHEET_ANSWER_STATS = process.env.SHEET_ANSWER_STATS || 'answer_stats';
const SHEET_SCORE_DISTRIBUTION = process.env.SHEET_SCORE_DISTRIBUTION || 'score_distribution';

/**
 * Get authenticated Google Sheets client
 */
function getAuthClient() {
    try {
        let credentials;

        // Try to parse full JSON first
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            // Fallback to individual fields
            credentials = {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        } else {
            throw new Error('Missing Google Service Account credentials');
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return auth;
    } catch (error) {
        console.error('Error creating auth client:', error);
        throw new Error('Failed to authenticate with Google Sheets');
    }
}

/**
 * Get Google Sheets API instance
 */
async function getSheetsClient() {
    const auth = getAuthClient();
    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
}

/**
 * Get spreadsheet ID from environment
 */
function getSpreadsheetId() {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error('GOOGLE_SPREADSHEET_ID not configured');
    }
    return spreadsheetId;
}

/**
 * Read data from a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {string} range - A1 notation range (e.g., "A1:Z100")
 * @returns {Promise<Array>} - 2D array of values
 */
async function readSheet(sheetName, range = '') {
    try {
        const sheets = await getSheetsClient();
        const spreadsheetId = getSpreadsheetId();
        const fullRange = range ? `${sheetName}!${range}` : sheetName;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: fullRange,
        });

        return response.data.values || [];
    } catch (error) {
        console.error(`Error reading sheet ${sheetName}:`, error.message);
        throw error;
    }
}

/**
 * Append rows to a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {Array<Array>} values - 2D array of values to append
 * @returns {Promise<Object>} - Response from Sheets API
 */
async function appendToSheet(sheetName, values) {
    try {
        const sheets = await getSheetsClient();
        const spreadsheetId = getSpreadsheetId();

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
        });

        return response.data;
    } catch (error) {
        console.error(`Error appending to sheet ${sheetName}:`, error.message);
        throw error;
    }
}

/**
 * Update specific cells in a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {string} range - A1 notation range
 * @param {Array<Array>} values - 2D array of values
 * @returns {Promise<Object>} - Response from Sheets API
 */
async function updateSheet(sheetName, range, values) {
    try {
        const sheets = await getSheetsClient();
        const spreadsheetId = getSpreadsheetId();

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${range}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        return response.data;
    } catch (error) {
        console.error(`Error updating sheet ${sheetName}:`, error.message);
        throw error;
    }
}

/**
 * Get all questions from the questions sheet
 * Expected format: questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex
 */
async function getQuestions() {
    const rows = await readSheet(SHEET_QUESTIONS, 'A2:F'); // Skip header row

    return rows.map(row => ({
        id: row[0],
        question: row[1],
        answers: [row[2], row[3], row[4]],
        correctIndex: parseInt(row[5], 10),
    }));
}

/**
 * Create a new session in the sessions sheet
 * @param {string} sessionID - Unique session identifier
 * @param {string} timestamp - ISO timestamp
 */
async function createSession(sessionID, timestamp) {
    await appendToSheet(SHEET_SESSIONS, [
        [sessionID, timestamp, '', 'started', '', '', '']
    ]);
}

/**
 * Update session when completed
 * @param {string} sessionID - Session identifier
 * @param {string} timestampEnd - ISO timestamp
 * @param {number} finalScore - Final score
 * @param {number} totalQuestions - Total questions
 */
async function completeSession(sessionID, timestampEnd, finalScore, totalQuestions) {
    // Find the session row
    const rows = await readSheet(SHEET_SESSIONS, 'A:G');
    const sessionIndex = rows.findIndex(row => row[0] === sessionID);

    if (sessionIndex === -1) {
        throw new Error('Session not found');
    }

    const percentage = ((finalScore / totalQuestions) * 100).toFixed(2);

    // Update the row (1-indexed, +1 for header)
    const rowNumber = sessionIndex + 1;
    await updateSheet(SHEET_SESSIONS, `C${rowNumber}:G${rowNumber}`, [
        [timestampEnd, 'completed', finalScore, totalQuestions, percentage]
    ]);
}

/**
 * Mark session as abandoned
 * @param {string} sessionID - Session identifier
 */
async function abandonSession(sessionID) {
    const rows = await readSheet(SHEET_SESSIONS, 'A:G');
    const sessionIndex = rows.findIndex(row => row[0] === sessionID);

    if (sessionIndex === -1) {
        throw new Error('Session not found');
    }

    const rowNumber = sessionIndex + 1;
    await updateSheet(SHEET_SESSIONS, `D${rowNumber}`, [['abandoned']]);
}

/**
 * Record an answer and update statistics
 * @param {string} questionID - Question identifier
 * @param {number} selectedAnswerIndex - Index of selected answer (0-2)
 * @returns {Promise<Object>} - Updated statistics
 */
async function recordAnswer(questionID, selectedAnswerIndex) {
    // Read current stats
    const rows = await readSheet(SHEET_ANSWER_STATS, 'A:F');
    let questionIndex = rows.findIndex(row => row[0] === questionID);

    let answer0Count = 0;
    let answer1Count = 0;
    let answer2Count = 0;
    let totalResponses = 0;

    if (questionIndex === -1) {
        // Question not in stats yet, create new row
        answer0Count = selectedAnswerIndex === 0 ? 1 : 0;
        answer1Count = selectedAnswerIndex === 1 ? 1 : 0;
        answer2Count = selectedAnswerIndex === 2 ? 1 : 0;
        totalResponses = 1;

        await appendToSheet(SHEET_ANSWER_STATS, [
            [questionID, answer0Count, answer1Count, answer2Count, totalResponses]
        ]);
    } else {
        // Update existing row
        const currentRow = rows[questionIndex];
        answer0Count = parseInt(currentRow[1] || 0, 10);
        answer1Count = parseInt(currentRow[2] || 0, 10);
        answer2Count = parseInt(currentRow[3] || 0, 10);
        totalResponses = parseInt(currentRow[4] || 0, 10);

        // Increment the selected answer
        if (selectedAnswerIndex === 0) answer0Count++;
        if (selectedAnswerIndex === 1) answer1Count++;
        if (selectedAnswerIndex === 2) answer2Count++;
        totalResponses++;

        const rowNumber = questionIndex + 1;
        await updateSheet(SHEET_ANSWER_STATS, `B${rowNumber}:E${rowNumber}`, [
            [answer0Count, answer1Count, answer2Count, totalResponses]
        ]);
    }

    return {
        answer0Count,
        answer1Count,
        answer2Count,
        totalResponses,
        answerDistribution: [answer0Count, answer1Count, answer2Count],
    };
}

/**
 * Update score distribution
 * @param {number} score - Final score
 */
async function updateScoreDistribution(score) {
    const rows = await readSheet(SHEET_SCORE_DISTRIBUTION, 'A:B');
    let scoreIndex = rows.findIndex(row => parseInt(row[0], 10) === score);

    if (scoreIndex === -1) {
        // New score entry
        await appendToSheet(SHEET_SCORE_DISTRIBUTION, [[score, 1]]);
    } else {
        // Update existing count
        const currentCount = parseInt(rows[scoreIndex][1] || 0, 10);
        const rowNumber = scoreIndex + 1;
        await updateSheet(SHEET_SCORE_DISTRIBUTION, `B${rowNumber}`, [[currentCount + 1]]);
    }
}

/**
 * Get score distribution for chart
 * @returns {Promise<Array>} - Array of {score, count} objects
 */
async function getScoreDistribution() {
    const rows = await readSheet(SHEET_SCORE_DISTRIBUTION, 'A2:B'); // Skip header

    return rows.map(row => ({
        score: parseInt(row[0], 10),
        count: parseInt(row[1], 10),
    })).sort((a, b) => a.score - b.score);
}

module.exports = {
    getQuestions,
    createSession,
    completeSession,
    abandonSession,
    recordAnswer,
    updateScoreDistribution,
    getScoreDistribution,
    // Export raw functions for testing
    readSheet,
    appendToSheet,
    updateSheet,
};
