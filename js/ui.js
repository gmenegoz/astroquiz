/**
 * Quiz UI Controller
 * Handles all user interface interactions and display updates
 * Now includes answer statistics and score distribution visualization
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
        // Show loading state
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Caricamento...';

        // Load questions
        const loaded = await quiz.loadQuestions();
        if (!loaded) {
            this.startBtn.disabled = false;
            this.startBtn.textContent = 'Inizia il Quiz';
            return;
        }

        // Start session
        await quiz.startSession();

        // Show quiz screen
        this.showScreen('quiz');
        this.updateProgress();
        this.displayQuestion();

        // Reset button
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Inizia il Quiz';
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
    async selectAnswer(answerIndex) {
        // Prevent multiple selections
        if (this.selectedAnswerIndex !== null) {
            return;
        }

        // Clear inactivity timer (user is active)
        this.clearInactivityTimer();

        this.selectedAnswerIndex = answerIndex;
        const buttons = this.answersContainer.querySelectorAll('.answer-btn');

        // Disable all buttons during processing
        buttons.forEach(btn => btn.disabled = true);

        // Check answer and get statistics
        const result = await quiz.checkAnswer(answerIndex);
        const isCorrect = result.isCorrect;
        const statistics = result.statistics;
        const correctIndex = quiz.getCorrectAnswerIndex();

        // Update button states
        buttons.forEach((btn, index) => {
            if (index === answerIndex) {
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (index === correctIndex && !isCorrect) {
                btn.classList.add('correct');
            }
        });

        // Show feedback with statistics
        this.showFeedback(isCorrect, statistics);
        this.updateProgress();

        // Start auto-advance timer
        this.startAutoAdvanceTimer();
    }

    /**
     * Show feedback after answer selection
     */
    showFeedback(isCorrect, statistics) {
        this.feedbackContainer.classList.remove('hidden');
        this.feedbackContainer.classList.add(isCorrect ? 'correct' : 'incorrect');

        // Base feedback message
        let message = isCorrect ? '✓ Risposta corretta!' : '✗ Risposta sbagliata!';

        // Add statistics if available
        if (statistics && statistics.totalResponses > 0) {
            message += `\n\n📊 ${statistics.correctPercentage.toFixed(1)}% delle persone ha risposto correttamente`;
            message += `\n(su ${statistics.totalResponses} ${statistics.totalResponses === 1 ? 'risposta' : 'risposte'})`;
        }

        this.feedbackText.textContent = message;
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
     * Show results screen with score distribution
     */
    async showResults() {
        // Complete the session
        await quiz.completeSession();

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

        // Load and display score distribution
        await this.displayScoreDistribution();

        this.showScreen('results');
    }

    /**
     * Display score distribution chart
     */
    async displayScoreDistribution() {
        const distributionData = await quiz.getScoreDistribution();

        if (!distributionData || !distributionData.distribution || distributionData.distribution.length === 0) {
            console.log('No score distribution data available');
            return;
        }

        const chartContainer = document.getElementById('score-distribution-chart');
        if (!chartContainer) {
            console.error('Chart container not found');
            return;
        }

        // Prepare data for Chart.js
        const scores = distributionData.distribution.map(d => d.score);
        const counts = distributionData.distribution.map(d => d.count);

        // Destroy existing chart if any
        if (window.scoreChart) {
            window.scoreChart.destroy();
        }

        // Create new chart
        const ctx = chartContainer.getContext('2d');
        window.scoreChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scores.map(s => `${s} punti`),
                datasets: [{
                    label: 'Numero di persone',
                    data: counts,
                    backgroundColor: 'rgba(232, 165, 88, 0.6)',
                    borderColor: 'rgba(232, 165, 88, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribuzione dei Punteggi',
                        color: '#E8A558',
                        font: {
                            size: 18
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });

        // Show statistics
        const statsContainer = document.getElementById('score-statistics');
        if (statsContainer && distributionData.statistics) {
            statsContainer.innerHTML = `
                <p><strong>Punteggio medio:</strong> ${distributionData.statistics.averageScore} su ${quiz.getTotalQuestions()}</p>
                <p><strong>Risposte totali:</strong> ${distributionData.statistics.totalResponses}</p>
            `;
        }
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
        quiz.reset(); // This will also abandon the session
        this.showScreen('welcome');
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new QuizUI();
});
