/**
 * API Configuration
 * Configure the backend API URL here
 */

const API_CONFIG = {
    // Backend API base URL
    // Development: http://localhost:3000 (when running vercel dev)
    // Production: https://your-vercel-deployment.vercel.app
    BASE_URL: 'http://localhost:3000', // Change this to your Vercel deployment URL

    // API Endpoints
    ENDPOINTS: {
        GET_QUESTIONS: '/api/get-questions',
        START_SESSION: '/api/start-session',
        RECORD_ANSWER: '/api/record-answer',
        COMPLETE_SESSION: '/api/complete-session',
        ABANDON_SESSION: '/api/abandon-session',
        GET_SCORE_DISTRIBUTION: '/api/get-score-distribution',
        GET_SCORE_DESCRIPTIONS: '/api/get-score-descriptions',
    },

    // Request timeout (ms)
    TIMEOUT: 10000,
};

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
        }
        throw error;
    }
}
