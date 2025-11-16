/**
 * Quiz Backend Logic
 * Handles question loading, answer validation, and score tracking
 */

class Quiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
    }

    /**
     * Load questions from embedded data
     */
    async loadQuestions() {
        try {
            // Questions data embedded to avoid CORS issues
            this.questions = [
                {
                    "uniqueID": "cannocchiale",
                    "question": "Chi ha inventato il cannocchiale?",
                    "subject": "strumenti",
                    "answers": [
                        {"answer": "Galileo Galilei", "correct": false},
                        {"answer": "Paolo Antoniazzi", "correct": false},
                        {"answer": "Qualcun altro", "correct": true}
                    ]
                },
                {
                    "uniqueID": "congiunzione",
                    "question": "Cosa succede durante una congiunzione planetaria?",
                    "subject": "congiunzione",
                    "answers": [
                        {"answer": "Due pianeti si fondono e diventano un'unico oggetto", "correct": false},
                        {"answer": "Dal nostro punto di vista sembrano molto vicini", "correct": true},
                        {"answer": "I nati nel Capricorno incontrano l'anima gemella", "correct": false}
                    ]
                },
                {
                    "uniqueID": "stelle cadenti",
                    "question": "Quanto sono grandi i frammenti di roccia che danno origine ad uno sciame di stelle cadenti?",
                    "subject": "meteore",
                    "answers": [
                        {"answer": "Come un granello di sabbia", "correct": true},
                        {"answer": "Come un pugno", "correct": false},
                        {"answer": "Come un'automobile", "correct": false}
                    ]
                }
            ];
            this.shuffleQuestions();
            this.shuffleAnswers();
            return true;
        } catch (error) {
            console.error('Errore nel caricamento delle domande:', error);
            return false;
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
     * Check if the selected answer is correct
     * @param {number} answerIndex - Index of the selected answer
     * @returns {boolean} - True if answer is correct
     */
    checkAnswer(answerIndex) {
        const currentQuestion = this.getCurrentQuestion();
        const selectedAnswer = currentQuestion.answers[answerIndex];

        this.userAnswers.push({
            questionId: currentQuestion.uniqueID,
            selectedAnswer: selectedAnswer.answer,
            isCorrect: selectedAnswer.correct
        });

        if (selectedAnswer.correct) {
            this.score++;
            return true;
        }
        return false;
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
     * Reset quiz
     */
    reset() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
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
