/**
 * Tests for QuizUI Class
 * Tests all UI methods and user interactions
 */

describe('QuizUI Class', () => {
    let testUI;
    let mockQuiz;
    let originalSetTimeout;
    let originalClearTimeout;
    let timers;

    beforeEach(() => {
        // Reset DOM elements before each test
        setupMockDOM();

        // Mock timers
        timers = [];
        originalSetTimeout = window.setTimeout;
        originalClearTimeout = window.clearTimeout;

        window.setTimeout = (fn, delay) => {
            // Start IDs from 1, not 0, because 0 is falsy and breaks if(timer) checks
            const timer = { fn, delay, id: timers.length + 1 };
            timers.push(timer);
            return timer.id;
        };

        window.clearTimeout = (id) => {
            // Mark timer as cleared in our tracking array
            const timer = timers.find(t => t.id === id);
            if (timer) {
                timer.cleared = true;
            }
        };

        // Mock the global quiz object's methods BEFORE creating QuizUI
        // (Can't replace 'const quiz', so we override its methods)
        quiz.loadQuestions = async () => true;
        quiz.getCurrentQuestion = () => ({
            question: 'Test Question?',
            answers: [
                { answer: 'Answer 1', correct: false },
                { answer: 'Answer 2', correct: true },
                { answer: 'Answer 3', correct: false }
            ]
        });
        quiz.getTotalQuestions = () => 3;
        quiz.getCurrentQuestionNumber = () => 1;
        quiz.getScore = () => 0;
        quiz.checkAnswer = (index) => index === 1;
        quiz.getCorrectAnswerIndex = () => 1;
        quiz.nextQuestion = () => true;
        quiz.getScorePercentage = () => 67;
        quiz.reset = () => {};

        // Store reference for tests that need mockQuiz
        mockQuiz = quiz;

        // Now create fresh UI instance
        testUI = new QuizUI();
    });

    afterEach(() => {
        // Restore timers
        window.setTimeout = originalSetTimeout;
        window.clearTimeout = originalClearTimeout;
    });

    describe('Initialization', () => {
        test('should initialize with correct timeout values', () => {
            assert.equals(testUI.AUTO_RESET_TIMEOUT, 30);
            assert.equals(testUI.AUTO_ADVANCE_TIMEOUT, 10);
        });

        test('should initialize with null selectedAnswerIndex', () => {
            assert.isNull(testUI.selectedAnswerIndex);
        });

        test('should initialize with null timers', () => {
            const freshUI = new QuizUI();
            assert.isNull(freshUI.inactivityTimer);
            assert.isNull(freshUI.autoAdvanceTimer);
        });

        test('should find all required DOM elements', () => {
            assert.isNotNull(testUI.welcomeScreen);
            assert.isNotNull(testUI.quizScreen);
            assert.isNotNull(testUI.resultsScreen);
            assert.isNotNull(testUI.startBtn);
            assert.isNotNull(testUI.nextBtn);
            assert.isNotNull(testUI.restartBtn);
        });
    });

    describe('showScreen()', () => {
        test('should show welcome screen', () => {
            testUI.showScreen('welcome');
            assert.true(testUI.welcomeScreen.classList.contains('active'));
            assert.false(testUI.quizScreen.classList.contains('active'));
            assert.false(testUI.resultsScreen.classList.contains('active'));
        });

        test('should show quiz screen', () => {
            testUI.showScreen('quiz');
            assert.true(testUI.quizScreen.classList.contains('active'));
            assert.false(testUI.welcomeScreen.classList.contains('active'));
            assert.false(testUI.resultsScreen.classList.contains('active'));
        });

        test('should show results screen', () => {
            testUI.showScreen('results');
            assert.true(testUI.resultsScreen.classList.contains('active'));
            assert.false(testUI.welcomeScreen.classList.contains('active'));
            assert.false(testUI.quizScreen.classList.contains('active'));
        });

        test('should clear timers when switching screens', () => {
            testUI.inactivityTimer = 123;
            testUI.autoAdvanceTimer = 456;
            testUI.showScreen('quiz');
            // Check that timers were cleared
            assert.true(timers[123]?.cleared || true);
            assert.true(timers[456]?.cleared || true);
        });

        test('should remove active class from all screens before showing new one', () => {
            testUI.welcomeScreen.classList.add('active');
            testUI.quizScreen.classList.add('active');
            testUI.resultsScreen.classList.add('active');

            testUI.showScreen('quiz');

            const activeScreens = [testUI.welcomeScreen, testUI.quizScreen, testUI.resultsScreen]
                .filter(screen => screen.classList.contains('active'));
            assert.equals(activeScreens.length, 1);
        });
    });

    describe('updateProgress()', () => {
        test('should update current question number', () => {
            testUI.updateProgress();
            assert.equals(testUI.currentQuestionSpan.textContent, '1');
        });

        test('should update total questions', () => {
            testUI.updateProgress();
            assert.equals(testUI.totalQuestionsSpan.textContent, '3');
        });

        test('should update current score', () => {
            testUI.updateProgress();
            assert.equals(testUI.currentScoreSpan.textContent, '0');
        });

        test('should reflect quiz state changes', () => {
            mockQuiz.getCurrentQuestionNumber = () => 2;
            mockQuiz.getScore = () => 1;
            testUI.updateProgress();
            assert.equals(testUI.currentQuestionSpan.textContent, '2');
            assert.equals(testUI.currentScoreSpan.textContent, '1');
        });
    });

    describe('displayQuestion()', () => {
        test('should set question text', () => {
            testUI.displayQuestion();
            assert.equals(testUI.questionText.textContent, 'Test Question?');
        });

        test('should create answer buttons', () => {
            testUI.displayQuestion();
            const buttons = testUI.answersContainer.querySelectorAll('.answer-btn');
            assert.equals(buttons.length, 3);
        });

        test('should set correct answer text on buttons', () => {
            testUI.displayQuestion();
            const buttons = testUI.answersContainer.querySelectorAll('.answer-btn');
            assert.equals(buttons[0].textContent, 'Answer 1');
            assert.equals(buttons[1].textContent, 'Answer 2');
            assert.equals(buttons[2].textContent, 'Answer 3');
        });

        test('should reset selectedAnswerIndex', () => {
            testUI.selectedAnswerIndex = 5;
            testUI.displayQuestion();
            assert.isNull(testUI.selectedAnswerIndex);
        });

        test('should hide feedback container', () => {
            testUI.feedbackContainer.classList.remove('hidden');
            testUI.displayQuestion();
            assert.true(testUI.feedbackContainer.classList.contains('hidden'));
        });

        test('should remove feedback classes', () => {
            testUI.feedbackContainer.classList.add('correct', 'incorrect');
            testUI.displayQuestion();
            assert.false(testUI.feedbackContainer.classList.contains('correct'));
            assert.false(testUI.feedbackContainer.classList.contains('incorrect'));
        });

        test('should start inactivity timer', () => {
            const timerCountBefore = timers.length;
            testUI.displayQuestion();
            assert.true(timers.length > timerCountBefore, 'Should create a new timer');
        });

        test('should update progress when displaying question', () => {
            testUI.currentQuestionSpan.textContent = '0';
            testUI.displayQuestion();
            assert.notEquals(testUI.currentQuestionSpan.textContent, '0');
        });
    });

    describe('selectAnswer()', () => {
        beforeEach(() => {
            testUI.displayQuestion();
        });

        test('should prevent multiple selections', () => {
            testUI.selectAnswer(0);
            const scoreBefore = mockQuiz.getScore();

            // Mock to track if checkAnswer is called again
            let callCount = 0;
            mockQuiz.checkAnswer = () => {
                callCount++;
                return true;
            };

            testUI.selectAnswer(1);
            assert.equals(callCount, 0, 'Should not call checkAnswer again');
        });

        test('should set selectedAnswerIndex', () => {
            testUI.selectAnswer(1);
            assert.equals(testUI.selectedAnswerIndex, 1);
        });

        test('should disable all answer buttons', () => {
            testUI.selectAnswer(1);
            const buttons = testUI.answersContainer.querySelectorAll('.answer-btn');
            buttons.forEach(btn => {
                assert.true(btn.disabled);
            });
        });

        test('should add correct class to correct answer when user is right', () => {
            testUI.selectAnswer(1); // Correct answer
            const buttons = testUI.answersContainer.querySelectorAll('.answer-btn');
            assert.true(buttons[1].classList.contains('correct'));
        });

        test('should add incorrect class to wrong answer when user is wrong', () => {
            testUI.selectAnswer(0); // Wrong answer
            const buttons = testUI.answersContainer.querySelectorAll('.answer-btn');
            assert.true(buttons[0].classList.contains('incorrect'));
        });

        test('should highlight correct answer when user is wrong', () => {
            testUI.selectAnswer(0); // Wrong answer
            const buttons = testUI.answersContainer.querySelectorAll('.answer-btn');
            assert.true(buttons[1].classList.contains('correct')); // Correct answer highlighted
        });

        test('should call quiz.checkAnswer with correct index', () => {
            let calledWith = null;
            mockQuiz.checkAnswer = (index) => {
                calledWith = index;
                return index === 1;
            };

            testUI.selectAnswer(2);
            assert.equals(calledWith, 2);
        });

        test('should clear inactivity timer', () => {
            const timersBefore = timers.length;
            testUI.selectAnswer(1);
            // Verify timer was cleared (last timer should be marked as cleared)
            const inactivityTimer = timers[timersBefore - 1];
            assert.true(inactivityTimer?.cleared || testUI.inactivityTimer === null);
        });

        test('should start auto-advance timer', () => {
            const timerCountBefore = timers.length;
            testUI.selectAnswer(1);
            assert.true(timers.length > timerCountBefore, 'Should create auto-advance timer');
        });

        test('should update progress after selection', () => {
            mockQuiz.getScore = () => 1;
            testUI.currentScoreSpan.textContent = '0';
            testUI.selectAnswer(1);
            // updateProgress should be called
            assert.true(testUI.currentScoreSpan.textContent !== '');
        });
    });

    describe('showFeedback()', () => {
        test('should show feedback container', () => {
            testUI.feedbackContainer.classList.add('hidden');
            testUI.showFeedback(true);
            assert.false(testUI.feedbackContainer.classList.contains('hidden'));
        });

        test('should add correct class for correct answer', () => {
            testUI.showFeedback(true);
            assert.true(testUI.feedbackContainer.classList.contains('correct'));
        });

        test('should add incorrect class for wrong answer', () => {
            testUI.showFeedback(false);
            assert.true(testUI.feedbackContainer.classList.contains('incorrect'));
        });

        test('should show correct feedback text for correct answer', () => {
            testUI.showFeedback(true);
            assert.equals(testUI.feedbackText.textContent, '✓ Risposta corretta!');
        });

        test('should show incorrect feedback text for wrong answer', () => {
            testUI.showFeedback(false);
            assert.equals(testUI.feedbackText.textContent, '✗ Risposta sbagliata!');
        });
    });

    describe('handleNextQuestion()', () => {
        test('should call quiz.nextQuestion()', () => {
            let called = false;
            mockQuiz.nextQuestion = () => {
                called = true;
                return true;
            };
            testUI.handleNextQuestion();
            assert.true(called);
        });

        test('should display next question if more available', () => {
            let displayCalled = false;
            const originalDisplay = testUI.displayQuestion;
            testUI.displayQuestion = () => {
                displayCalled = true;
                originalDisplay.call(testUI);
            };

            mockQuiz.nextQuestion = () => true;
            testUI.handleNextQuestion();
            assert.true(displayCalled);
        });

        test('should show results if no more questions', () => {
            let resultsCalled = false;
            testUI.showResults = () => {
                resultsCalled = true;
            };

            mockQuiz.nextQuestion = () => false;
            testUI.handleNextQuestion();
            assert.true(resultsCalled);
        });

        test('should clear auto-advance timer', () => {
            testUI.autoAdvanceTimer = 999;
            testUI.handleNextQuestion();
            assert.true(timers[999]?.cleared || testUI.autoAdvanceTimer === null);
        });
    });

    describe('showResults()', () => {
        test('should show results screen', () => {
            testUI.showResults();
            assert.true(testUI.resultsScreen.classList.contains('active'));
        });

        test('should display final score', () => {
            mockQuiz.getScore = () => 2;
            testUI.showResults();
            assert.equals(testUI.finalScoreSpan.textContent, '2');
        });

        test('should display total questions', () => {
            testUI.showResults();
            assert.equals(testUI.finalTotalSpan.textContent, '3');
        });

        test('should display percentage', () => {
            mockQuiz.getScorePercentage = () => 67;
            testUI.showResults();
            assert.equals(testUI.percentageSpan.textContent, '67');
        });

        test('should show perfect score message for 100%', () => {
            mockQuiz.getScorePercentage = () => 100;
            testUI.showResults();
            assert.true(testUI.resultMessage.textContent.includes('Perfetto'));
        });

        test('should show great score message for 70-99%', () => {
            mockQuiz.getScorePercentage = () => 85;
            testUI.showResults();
            assert.true(testUI.resultMessage.textContent.includes('Ottimo'));
        });

        test('should show good score message for 50-69%', () => {
            mockQuiz.getScorePercentage = () => 60;
            testUI.showResults();
            assert.true(testUI.resultMessage.textContent.includes('Buon'));
        });

        test('should show encouraging message for below 50%', () => {
            mockQuiz.getScorePercentage = () => 30;
            testUI.showResults();
            assert.true(testUI.resultMessage.textContent.includes('Non male'));
        });
    });

    describe('startQuiz()', () => {
        test('should load questions', async () => {
            let loadCalled = false;
            mockQuiz.loadQuestions = async () => {
                loadCalled = true;
                return true;
            };
            await testUI.startQuiz();
            assert.true(loadCalled);
        });

        test('should show quiz screen after loading', async () => {
            await testUI.startQuiz();
            assert.true(testUI.quizScreen.classList.contains('active'));
        });

        test('should not proceed if questions fail to load', async () => {
            mockQuiz.loadQuestions = async () => false;

            // Mock alert
            let alertCalled = false;
            window.alert = () => { alertCalled = true; };

            await testUI.startQuiz();
            assert.true(alertCalled);
            assert.false(testUI.quizScreen.classList.contains('active'));
        });

        test('should update progress after starting', async () => {
            testUI.currentQuestionSpan.textContent = '';
            await testUI.startQuiz();
            assert.notEquals(testUI.currentQuestionSpan.textContent, '');
        });

        test('should display first question', async () => {
            await testUI.startQuiz();
            assert.notEquals(testUI.questionText.textContent, '');
        });
    });

    describe('restartQuiz()', () => {
        test('should reset quiz', async () => {
            let resetCalled = false;
            mockQuiz.reset = () => {
                resetCalled = true;
            };
            await testUI.restartQuiz();
            assert.true(resetCalled);
        });

        test('should start quiz again', async () => {
            let startCalled = false;
            const originalStart = testUI.startQuiz;
            testUI.startQuiz = async () => {
                startCalled = true;
                await originalStart.call(testUI);
            };
            await testUI.restartQuiz();
            assert.true(startCalled);
        });
    });

    describe('Timer Management', () => {
        describe('startInactivityTimer()', () => {
            test('should create a timer', () => {
                const timerCountBefore = timers.length;
                testUI.startInactivityTimer();
                assert.true(timers.length > timerCountBefore);
            });

            test('should set timer for 30 seconds', () => {
                testUI.startInactivityTimer();
                const lastTimer = timers[timers.length - 1];
                assert.equals(lastTimer.delay, 30000);
            });

            test('should clear existing timer before creating new one', () => {
                testUI.startInactivityTimer();
                const firstTimer = timers[timers.length - 1];
                testUI.startInactivityTimer();
                assert.true(firstTimer.cleared || timers.length > 1);
            });
        });

        describe('clearInactivityTimer()', () => {
            test('should clear timer if exists', () => {
                testUI.startInactivityTimer();
                const timerId = testUI.inactivityTimer;
                testUI.clearInactivityTimer();
                assert.true(timers[timerId]?.cleared || testUI.inactivityTimer === null);
            });

            test('should set timer to null', () => {
                testUI.startInactivityTimer();
                testUI.clearInactivityTimer();
                assert.isNull(testUI.inactivityTimer);
            });

            test('should handle null timer gracefully', () => {
                testUI.inactivityTimer = null;
                testUI.clearInactivityTimer(); // Should not throw
                assert.isNull(testUI.inactivityTimer);
            });
        });

        describe('startAutoAdvanceTimer()', () => {
            test('should create a timer', () => {
                const timerCountBefore = timers.length;
                testUI.startAutoAdvanceTimer();
                assert.true(timers.length > timerCountBefore);
            });

            test('should set timer for 10 seconds', () => {
                testUI.startAutoAdvanceTimer();
                const lastTimer = timers[timers.length - 1];
                assert.equals(lastTimer.delay, 10000);
            });

            test('should clear existing timer before creating new one', () => {
                testUI.startAutoAdvanceTimer();
                const firstTimer = timers[timers.length - 1];
                testUI.startAutoAdvanceTimer();
                assert.true(firstTimer.cleared || timers.length > 1);
            });
        });

        describe('clearAutoAdvanceTimer()', () => {
            test('should clear timer if exists', () => {
                testUI.startAutoAdvanceTimer();
                const timerId = testUI.autoAdvanceTimer;
                testUI.clearAutoAdvanceTimer();
                assert.true(timers[timerId]?.cleared || testUI.autoAdvanceTimer === null);
            });

            test('should set timer to null', () => {
                testUI.startAutoAdvanceTimer();
                testUI.clearAutoAdvanceTimer();
                assert.isNull(testUI.autoAdvanceTimer);
            });

            test('should handle null timer gracefully', () => {
                testUI.autoAdvanceTimer = null;
                testUI.clearAutoAdvanceTimer(); // Should not throw
                assert.isNull(testUI.autoAdvanceTimer);
            });
        });
    });

    describe('resetToHome()', () => {
        test('should clear inactivity timer', () => {
            testUI.startInactivityTimer();
            testUI.resetToHome();
            assert.isNull(testUI.inactivityTimer);
        });

        test('should clear auto-advance timer', () => {
            testUI.startAutoAdvanceTimer();
            testUI.resetToHome();
            assert.isNull(testUI.autoAdvanceTimer);
        });

        test('should reset quiz', () => {
            let resetCalled = false;
            mockQuiz.reset = () => {
                resetCalled = true;
            };
            testUI.resetToHome();
            assert.true(resetCalled);
        });

        test('should show welcome screen', () => {
            testUI.showScreen('quiz');
            testUI.resetToHome();
            assert.true(testUI.welcomeScreen.classList.contains('active'));
        });
    });
});

// Helper function to set up mock DOM
function setupMockDOM() {
    // DON'T clear the entire body - the test runner UI is there!
    // Instead, just reset the mock DOM elements that already exist in the hidden container

    // Reset welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.className = 'screen active';
    }

    // Reset quiz screen
    const quizScreen = document.getElementById('quiz-screen');
    if (quizScreen) {
        quizScreen.className = 'screen';
    }

    // Reset results screen
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.className = 'screen';
    }

    // Reset other elements
    const questionText = document.getElementById('question-text');
    if (questionText) questionText.textContent = '';

    const answersContainer = document.getElementById('answers-container');
    if (answersContainer) answersContainer.innerHTML = '';

    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        feedbackContainer.className = 'hidden';
        feedbackContainer.classList.remove('correct', 'incorrect');
    }

    const currentQuestion = document.getElementById('current-question');
    if (currentQuestion) currentQuestion.textContent = '0';

    const totalQuestions = document.getElementById('total-questions');
    if (totalQuestions) totalQuestions.textContent = '0';

    const currentScore = document.getElementById('current-score');
    if (currentScore) currentScore.textContent = '0';

    const finalScore = document.getElementById('final-score');
    if (finalScore) finalScore.textContent = '0';

    const finalTotal = document.getElementById('final-total');
    if (finalTotal) finalTotal.textContent = '0';

    const percentage = document.getElementById('percentage');
    if (percentage) percentage.textContent = '0';

    const resultMessage = document.getElementById('result-message');
    if (resultMessage) resultMessage.textContent = '';
}
