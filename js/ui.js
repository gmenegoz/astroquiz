/**
 * Quiz UI Controller
 * Handles all user interface interactions and display updates
 */

class QuizUI {
    constructor() {
        // Configuration - Timers (in seconds)
        this.AUTO_RESET_TIMEOUT = 30;  // Auto-reset to home if no answer after X seconds
        this.AUTO_ADVANCE_TIMEOUT = 10; // Auto-advance to next question after X seconds

        // Screen elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.resultsScreen = document.getElementById('results-screen');

        // Button elements
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // Quiz elements
        this.questionText = document.getElementById('question-text');
        this.answersContainer = document.getElementById('answers-container');
        this.currentQuestionSpan = document.getElementById('current-question');
        this.totalQuestionsSpan = document.getElementById('total-questions');
        this.currentScoreSpan = document.getElementById('current-score');

        // Feedback elements
        this.feedbackContainer = document.getElementById('feedback-container');
        this.feedbackText = document.getElementById('feedback-text');

        // Results elements
        this.finalScoreSpan = document.getElementById('final-score');
        this.finalTotalSpan = document.getElementById('final-total');
        this.percentageSpan = document.getElementById('percentage');
        this.resultMessage = document.getElementById('result-message');

        // State
        this.selectedAnswerIndex = null;

        // Timers
        this.inactivityTimer = null;
        this.autoAdvanceTimer = null;

        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.handleNextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    /**
     * Start the quiz
     */
    async startQuiz() {
        // Load questions
        const loaded = await quiz.loadQuestions();
        if (!loaded) {
            alert('Errore nel caricamento delle domande. Riprova.');
            return;
        }

        // Show quiz screen
        this.showScreen('quiz');
        this.updateProgress();
        this.displayQuestion();
    }

    /**
     * Display current question
     */
    displayQuestion() {
        const question = quiz.getCurrentQuestion();
        this.questionText.textContent = question.question;
        this.answersContainer.innerHTML = '';
        this.selectedAnswerIndex = null;

        // Create answer buttons
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.answer;
            button.addEventListener('click', () => this.selectAnswer(index));
            this.answersContainer.appendChild(button);
        });

        // Hide feedback
        this.feedbackContainer.classList.add('hidden');
        this.feedbackContainer.classList.remove('correct', 'incorrect');

        // Update progress
        this.updateProgress();

        // Start inactivity timer (auto-reset if no answer)
        this.startInactivityTimer();
    }

    /**
     * Handle answer selection
     */
    selectAnswer(answerIndex) {
        // Prevent multiple selections
        if (this.selectedAnswerIndex !== null) {
            return;
        }

        // Clear inactivity timer (user is active)
        this.clearInactivityTimer();

        this.selectedAnswerIndex = answerIndex;
        const buttons = this.answersContainer.querySelectorAll('.answer-btn');

        // Check if answer is correct
        const isCorrect = quiz.checkAnswer(answerIndex);
        const correctIndex = quiz.getCorrectAnswerIndex();

        // Update button states
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === answerIndex) {
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (index === correctIndex && !isCorrect) {
                btn.classList.add('correct');
            }
        });

        // Show feedback
        this.showFeedback(isCorrect);
        this.updateProgress();

        // Start auto-advance timer
        this.startAutoAdvanceTimer();
    }

    /**
     * Show feedback after answer selection
     */
    showFeedback(isCorrect) {
        this.feedbackContainer.classList.remove('hidden');
        this.feedbackContainer.classList.add(isCorrect ? 'correct' : 'incorrect');
        this.feedbackText.textContent = isCorrect ? '✓ Risposta corretta!' : '✗ Risposta sbagliata!';
    }

    /**
     * Handle next question button
     */
    handleNextQuestion() {
        // Clear auto-advance timer
        this.clearAutoAdvanceTimer();

        const hasMore = quiz.nextQuestion();
        if (hasMore) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    /**
     * Update progress display
     */
    updateProgress() {
        this.currentQuestionSpan.textContent = quiz.getCurrentQuestionNumber();
        this.totalQuestionsSpan.textContent = quiz.getTotalQuestions();
        this.currentScoreSpan.textContent = quiz.getScore();
    }

    /**
     * Show results screen
     */
    showResults() {
        const score = quiz.getScore();
        const total = quiz.getTotalQuestions();
        const percentage = quiz.getScorePercentage();

        this.finalScoreSpan.textContent = score;
        this.finalTotalSpan.textContent = total;
        this.percentageSpan.textContent = percentage;

        // Set result message based on score
        let message = '';
        if (percentage === 100) {
            message = 'Perfetto! Sei un vero esperto di astronomia! 🌟';
        } else if (percentage >= 70) {
            message = 'Ottimo lavoro! Conosci molto bene l\'astronomia! 🌙';
        } else if (percentage >= 50) {
            message = 'Buon risultato! Continua a studiare le stelle! ⭐';
        } else {
            message = 'Non male! C\'è ancora molto da imparare sull\'universo! 🌍';
        }

        this.resultMessage.textContent = message;
        this.showScreen('results');
    }

    /**
     * Restart the quiz
     */
    restartQuiz() {
        quiz.reset();
        this.startQuiz();
    }

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        // Clear all timers when changing screens
        this.clearInactivityTimer();
        this.clearAutoAdvanceTimer();

        this.welcomeScreen.classList.remove('active');
        this.quizScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');

        switch (screenName) {
            case 'welcome':
                this.welcomeScreen.classList.add('active');
                break;
            case 'quiz':
                this.quizScreen.classList.add('active');
                break;
            case 'results':
                this.resultsScreen.classList.add('active');
                break;
        }
    }

    /**
     * Start inactivity timer - auto-reset to home if no answer given
     */
    startInactivityTimer() {
        this.clearInactivityTimer();
        this.inactivityTimer = setTimeout(() => {
            console.log('Inactivity detected - resetting to home screen');
            this.resetToHome();
        }, this.AUTO_RESET_TIMEOUT * 1000);
    }

    /**
     * Clear inactivity timer
     */
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }

    /**
     * Start auto-advance timer - automatically move to next question
     */
    startAutoAdvanceTimer() {
        this.clearAutoAdvanceTimer();
        this.autoAdvanceTimer = setTimeout(() => {
            console.log('Auto-advancing to next question');
            this.handleNextQuestion();
        }, this.AUTO_ADVANCE_TIMEOUT * 1000);
    }

    /**
     * Clear auto-advance timer
     */
    clearAutoAdvanceTimer() {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
    }

    /**
     * Reset quiz and return to home screen
     */
    resetToHome() {
        this.clearInactivityTimer();
        this.clearAutoAdvanceTimer();
        quiz.reset();
        this.showScreen('welcome');
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new QuizUI();
});
