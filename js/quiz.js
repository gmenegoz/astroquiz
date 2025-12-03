/**
 * Quiz Backend Logic
 * Handles question loading, answer validation, and score tracking
 * Now integrated with backend API for Google Sheets persistence
 */

class Quiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.sessionID = null;
        this.sessionStartTime = null;
    }

    /**
     * Load questions from backend API
     */
    async loadQuestions() {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_QUESTIONS, {
                method: 'GET',
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to load questions');
            }

            // Transform backend format to match existing format
            this.questions = response.questions.map(q => ({
                uniqueID: q.id,
                question: q.question,
                subject: '', // Not used in current implementation
                answers: q.answers.map((answer, index) => ({
                    answer: answer,
                    correct: index === q.correctIndex,
                })),
            }));

            this.shuffleQuestions();
            this.shuffleAnswers();
            return true;
        } catch (error) {
            console.error('Errore nel caricamento delle domande:', error);
            alert('Errore di connessione al server. Verifica la configurazione API.');
            return false;
        }
    }

    /**
     * Start a new session (call backend to create session)
     */
    async startSession() {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.START_SESSION, {
                method: 'POST',
                body: JSON.stringify({}),
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to start session');
            }

            this.sessionID = response.sessionID;
            this.sessionStartTime = response.timestamp;
            console.log('Session started:', this.sessionID);
            return true;
        } catch (error) {
            console.error('Errore nell\'avvio della sessione:', error);
            // Non-blocking: continue even if session creation fails
            this.sessionID = 'offline-' + Date.now();
            return true;
        }
    }

    /**
     * Shuffle questions array
     */
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    /**
     * Shuffle answers for each question
     */
    shuffleAnswers() {
        this.questions.forEach(question => {
            const answers = question.answers;
            for (let i = answers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [answers[i], answers[j]] = [answers[j], answers[i]];
            }
        });
    }

    /**
     * Get current question
     */
    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    /**
     * Get total number of questions
     */
    getTotalQuestions() {
        return this.questions.length;
    }

    /**
     * Check if the selected answer is correct and record it to backend
     * @param {number} answerIndex - Index of the selected answer
     * @returns {Promise<Object>} - {isCorrect, statistics}
     */
    async checkAnswer(answerIndex) {
        const currentQuestion = this.getCurrentQuestion();
        const selectedAnswer = currentQuestion.answers[answerIndex];
        const isCorrect = selectedAnswer.correct;

        // Store answer locally
        this.userAnswers.push({
            questionId: currentQuestion.uniqueID,
            selectedAnswer: selectedAnswer.answer,
            isCorrect: isCorrect,
        });

        // Update score locally
        if (isCorrect) {
            this.score++;
        }

        // Record answer to backend and get statistics
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.RECORD_ANSWER, {
                method: 'POST',
                body: JSON.stringify({
                    sessionID: this.sessionID,
                    questionID: currentQuestion.uniqueID,
                    selectedAnswerIndex: answerIndex,
                }),
            });

            if (response.success) {
                return {
                    isCorrect: isCorrect,
                    statistics: response.statistics,
                };
            }
        } catch (error) {
            console.error('Errore nel salvataggio della risposta:', error);
        }

        // Return without statistics if backend call fails
        return {
            isCorrect: isCorrect,
            statistics: null,
        };
    }

    /**
     * Get the index of the correct answer for current question
     */
    getCorrectAnswerIndex() {
        const currentQuestion = this.getCurrentQuestion();
        return currentQuestion.answers.findIndex(answer => answer.correct);
    }

    /**
     * Move to next question
     * @returns {boolean} - True if there are more questions
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        return this.currentQuestionIndex < this.questions.length;
    }

    /**
     * Check if quiz is complete
     */
    isComplete() {
        return this.currentQuestionIndex >= this.questions.length;
    }

    /**
     * Get current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Get score percentage
     */
    getScorePercentage() {
        return Math.round((this.score / this.questions.length) * 100);
    }

    /**
     * Complete the session (save final results to backend)
     */
    async completeSession() {
        if (!this.sessionID) return;

        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.COMPLETE_SESSION, {
                method: 'POST',
                body: JSON.stringify({
                    sessionID: this.sessionID,
                    finalScore: this.score,
                    totalQuestions: this.questions.length,
                }),
            });

            if (response.success) {
                console.log('Session completed successfully');
                return true;
            }
        } catch (error) {
            console.error('Errore nel completamento della sessione:', error);
        }
        return false;
    }

    /**
     * Abandon the session (user left without completing)
     */
    async abandonSession() {
        if (!this.sessionID || this.sessionID.startsWith('offline-')) return;

        try {
            await apiRequest(API_CONFIG.ENDPOINTS.ABANDON_SESSION, {
                method: 'POST',
                body: JSON.stringify({
                    sessionID: this.sessionID,
                }),
            });
            console.log('Session abandoned');
        } catch (error) {
            console.error('Errore nell\'abbandono della sessione:', error);
        }
    }

    /**
     * Get score distribution for chart
     */
    async getScoreDistribution() {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_SCORE_DISTRIBUTION, {
                method: 'GET',
            });

            if (response.success) {
                return response;
            }
        } catch (error) {
            console.error('Errore nel caricamento della distribuzione dei punteggi:', error);
        }
        return null;
    }

    /**
     * Reset quiz
     */
    reset() {
        // Abandon current session if exists
        if (this.sessionID && !this.sessionID.startsWith('offline-')) {
            this.abandonSession(); // Fire and forget
        }

        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.sessionID = null;
        this.sessionStartTime = null;
        this.shuffleQuestions();
        this.shuffleAnswers();
    }

    /**
     * Get current question number (1-indexed for display)
     */
    getCurrentQuestionNumber() {
        return this.currentQuestionIndex + 1;
    }
}

// Create global quiz instance
const quiz = new Quiz();
