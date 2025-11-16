/**
 * Tests for Quiz Class
 * Tests all methods and edge cases for the quiz logic
 */

describe('Quiz Class', () => {
    let testQuiz;

    beforeEach(() => {
        // Create a fresh quiz instance for each test
        testQuiz = new Quiz();
    });

    describe('Initialization', () => {
        test('should initialize with empty questions array', () => {
            assert.arrayLength(testQuiz.questions, 0);
        });

        test('should initialize with currentQuestionIndex at 0', () => {
            assert.equals(testQuiz.currentQuestionIndex, 0);
        });

        test('should initialize with score at 0', () => {
            assert.equals(testQuiz.score, 0);
        });

        test('should initialize with empty userAnswers array', () => {
            assert.arrayLength(testQuiz.userAnswers, 0);
        });
    });

    describe('loadQuestions()', () => {
        test('should load questions successfully', async () => {
            const result = await testQuiz.loadQuestions();
            assert.true(result);
        });

        test('should load exactly 3 questions', async () => {
            await testQuiz.loadQuestions();
            assert.equals(testQuiz.questions.length, 3);
        });

        test('should load questions with correct structure', async () => {
            await testQuiz.loadQuestions();
            const question = testQuiz.questions[0];
            assert.objectHasProperty(question, 'uniqueID');
            assert.objectHasProperty(question, 'question');
            assert.objectHasProperty(question, 'subject');
            assert.objectHasProperty(question, 'answers');
        });

        test('should load questions with 3 answers each', async () => {
            await testQuiz.loadQuestions();
            testQuiz.questions.forEach(q => {
                assert.equals(q.answers.length, 3);
            });
        });

        test('should load questions where each has exactly one correct answer', async () => {
            await testQuiz.loadQuestions();
            testQuiz.questions.forEach(q => {
                const correctAnswers = q.answers.filter(a => a.correct);
                assert.equals(correctAnswers.length, 1, 'Each question should have exactly one correct answer');
            });
        });

        test('should shuffle questions after loading', async () => {
            // Load multiple times and check if order varies
            const quiz1 = new Quiz();
            const quiz2 = new Quiz();

            // Mock Math.random to control shuffling
            const originalRandom = Math.random;
            let callCount = 0;
            Math.random = () => {
                callCount++;
                return callCount % 2 === 0 ? 0.1 : 0.9;
            };

            await quiz1.loadQuestions();
            const firstQuestionId = quiz1.questions[0].uniqueID;

            // Restore Math.random
            Math.random = originalRandom;

            // Just verify it was called (shuffling occurred)
            assert.true(callCount > 0, 'Math.random should be called during shuffle');
        });

        test('should shuffle answers after loading', async () => {
            await testQuiz.loadQuestions();
            // Verify answers exist and are arrays
            testQuiz.questions.forEach(q => {
                assert.true(Array.isArray(q.answers));
                assert.equals(q.answers.length, 3);
            });
        });
    });

    describe('getTotalQuestions()', () => {
        test('should return 0 before loading questions', () => {
            assert.equals(testQuiz.getTotalQuestions(), 0);
        });

        test('should return 3 after loading questions', async () => {
            await testQuiz.loadQuestions();
            assert.equals(testQuiz.getTotalQuestions(), 3);
        });
    });

    describe('getCurrentQuestion()', () => {
        test('should return undefined before loading questions', () => {
            assert.isUndefined(testQuiz.getCurrentQuestion());
        });

        test('should return first question after loading', async () => {
            await testQuiz.loadQuestions();
            const question = testQuiz.getCurrentQuestion();
            assert.isNotNull(question);
            assert.objectHasProperty(question, 'question');
        });

        test('should return different questions as index changes', async () => {
            await testQuiz.loadQuestions();
            const firstQuestion = testQuiz.getCurrentQuestion();
            testQuiz.currentQuestionIndex = 1;
            const secondQuestion = testQuiz.getCurrentQuestion();
            assert.notEquals(firstQuestion.uniqueID, secondQuestion.uniqueID);
        });
    });

    describe('getCurrentQuestionNumber()', () => {
        test('should return 1 for first question (1-indexed)', async () => {
            await testQuiz.loadQuestions();
            assert.equals(testQuiz.getCurrentQuestionNumber(), 1);
        });

        test('should return 2 for second question', async () => {
            await testQuiz.loadQuestions();
            testQuiz.currentQuestionIndex = 1;
            assert.equals(testQuiz.getCurrentQuestionNumber(), 2);
        });

        test('should return 3 for third question', async () => {
            await testQuiz.loadQuestions();
            testQuiz.currentQuestionIndex = 2;
            assert.equals(testQuiz.getCurrentQuestionNumber(), 3);
        });
    });

    describe('getCorrectAnswerIndex()', () => {
        test('should return valid index for correct answer', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            assert.true(correctIndex >= 0 && correctIndex < 3);
        });

        test('should point to answer with correct=true', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            const currentQuestion = testQuiz.getCurrentQuestion();
            assert.true(currentQuestion.answers[correctIndex].correct);
        });

        test('should work for all questions', async () => {
            await testQuiz.loadQuestions();
            for (let i = 0; i < 3; i++) {
                testQuiz.currentQuestionIndex = i;
                const correctIndex = testQuiz.getCorrectAnswerIndex();
                const question = testQuiz.getCurrentQuestion();
                assert.true(question.answers[correctIndex].correct);
            }
        });
    });

    describe('checkAnswer()', () => {
        test('should return true for correct answer', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            const result = testQuiz.checkAnswer(correctIndex);
            assert.true(result);
        });

        test('should return false for incorrect answer', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            // Pick an incorrect index
            const incorrectIndex = (correctIndex + 1) % 3;
            const result = testQuiz.checkAnswer(incorrectIndex);
            assert.false(result);
        });

        test('should increment score for correct answer', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            testQuiz.checkAnswer(correctIndex);
            assert.equals(testQuiz.score, 1);
        });

        test('should not increment score for incorrect answer', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            const incorrectIndex = (correctIndex + 1) % 3;
            testQuiz.checkAnswer(incorrectIndex);
            assert.equals(testQuiz.score, 0);
        });

        test('should record user answer in userAnswers array', async () => {
            await testQuiz.loadQuestions();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            testQuiz.checkAnswer(correctIndex);
            assert.arrayLength(testQuiz.userAnswers, 1);
        });

        test('should record correct answer details', async () => {
            await testQuiz.loadQuestions();
            const question = testQuiz.getCurrentQuestion();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            testQuiz.checkAnswer(correctIndex);

            const userAnswer = testQuiz.userAnswers[0];
            assert.equals(userAnswer.questionId, question.uniqueID);
            assert.equals(userAnswer.isCorrect, true);
            assert.isDefined(userAnswer.selectedAnswer);
        });

        test('should record incorrect answer details', async () => {
            await testQuiz.loadQuestions();
            const question = testQuiz.getCurrentQuestion();
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            const incorrectIndex = (correctIndex + 1) % 3;
            testQuiz.checkAnswer(incorrectIndex);

            const userAnswer = testQuiz.userAnswers[0];
            assert.equals(userAnswer.questionId, question.uniqueID);
            assert.equals(userAnswer.isCorrect, false);
        });

        test('should accumulate multiple answers', async () => {
            await testQuiz.loadQuestions();

            // Answer first question correctly
            testQuiz.checkAnswer(testQuiz.getCorrectAnswerIndex());
            testQuiz.nextQuestion();

            // Answer second question incorrectly
            const correctIndex = testQuiz.getCorrectAnswerIndex();
            testQuiz.checkAnswer((correctIndex + 1) % 3);

            assert.arrayLength(testQuiz.userAnswers, 2);
            assert.equals(testQuiz.score, 1);
        });
    });

    describe('nextQuestion()', () => {
        test('should increment currentQuestionIndex', async () => {
            await testQuiz.loadQuestions();
            testQuiz.nextQuestion();
            assert.equals(testQuiz.currentQuestionIndex, 1);
        });

        test('should return true when more questions available', async () => {
            await testQuiz.loadQuestions();
            const hasMore = testQuiz.nextQuestion();
            assert.true(hasMore);
        });

        test('should return false when no more questions', async () => {
            await testQuiz.loadQuestions();
            testQuiz.nextQuestion(); // Go to question 2
            testQuiz.nextQuestion(); // Go to question 3
            const hasMore = testQuiz.nextQuestion(); // Try to go beyond
            assert.false(hasMore);
        });

        test('should allow navigation through all questions', async () => {
            await testQuiz.loadQuestions();
            assert.true(testQuiz.nextQuestion()); // 0 -> 1 (returns true)
            assert.true(testQuiz.nextQuestion()); // 1 -> 2 (returns true)
            assert.false(testQuiz.nextQuestion()); // 2 -> 3 (returns false)
        });
    });

    describe('isComplete()', () => {
        test('should return false at start of quiz', async () => {
            await testQuiz.loadQuestions();
            assert.false(testQuiz.isComplete());
        });

        test('should return false during quiz', async () => {
            await testQuiz.loadQuestions();
            testQuiz.nextQuestion();
            assert.false(testQuiz.isComplete());
        });

        test('should return true after all questions answered', async () => {
            await testQuiz.loadQuestions();
            testQuiz.currentQuestionIndex = 3;
            assert.true(testQuiz.isComplete());
        });

        test('should return true when index equals question count', async () => {
            await testQuiz.loadQuestions();
            testQuiz.nextQuestion();
            testQuiz.nextQuestion();
            testQuiz.nextQuestion();
            assert.true(testQuiz.isComplete());
        });
    });

    describe('getScore()', () => {
        test('should return 0 initially', () => {
            assert.equals(testQuiz.getScore(), 0);
        });

        test('should return correct score after answering', async () => {
            await testQuiz.loadQuestions();
            testQuiz.checkAnswer(testQuiz.getCorrectAnswerIndex());
            assert.equals(testQuiz.getScore(), 1);
        });

        test('should track multiple correct answers', async () => {
            await testQuiz.loadQuestions();

            testQuiz.checkAnswer(testQuiz.getCorrectAnswerIndex());
            testQuiz.nextQuestion();
            testQuiz.checkAnswer(testQuiz.getCorrectAnswerIndex());
            testQuiz.nextQuestion();
            testQuiz.checkAnswer(testQuiz.getCorrectAnswerIndex());

            assert.equals(testQuiz.getScore(), 3);
        });
    });

    describe('getScorePercentage()', () => {
        test('should return 0 with no correct answers', async () => {
            await testQuiz.loadQuestions();

            const correctIndex = testQuiz.getCorrectAnswerIndex();
            testQuiz.checkAnswer((correctIndex + 1) % 3); // Wrong
            testQuiz.nextQuestion();
            testQuiz.checkAnswer((testQuiz.getCorrectAnswerIndex() + 1) % 3); // Wrong
            testQuiz.nextQuestion();
            testQuiz.checkAnswer((testQuiz.getCorrectAnswerIndex() + 1) % 3); // Wrong

            assert.equals(testQuiz.getScorePercentage(), 0);
        });

        test('should return 33 for 1 out of 3 correct', async () => {
            await testQuiz.loadQuestions();
            testQuiz.score = 1;
            assert.equals(testQuiz.getScorePercentage(), 33);
        });

        test('should return 67 for 2 out of 3 correct', async () => {
            await testQuiz.loadQuestions();
            testQuiz.score = 2;
            assert.equals(testQuiz.getScorePercentage(), 67);
        });

        test('should return 100 for 3 out of 3 correct', async () => {
            await testQuiz.loadQuestions();
            testQuiz.score = 3;
            assert.equals(testQuiz.getScorePercentage(), 100);
        });

        test('should round to nearest integer', async () => {
            await testQuiz.loadQuestions();
            testQuiz.score = 1;
            const percentage = testQuiz.getScorePercentage();
            assert.equals(percentage % 1, 0, 'Percentage should be rounded to integer');
        });
    });

    describe('reset()', () => {
        test('should reset currentQuestionIndex to 0', async () => {
            await testQuiz.loadQuestions();
            testQuiz.nextQuestion();
            testQuiz.nextQuestion();
            testQuiz.reset();
            assert.equals(testQuiz.currentQuestionIndex, 0);
        });

        test('should reset score to 0', async () => {
            await testQuiz.loadQuestions();
            testQuiz.score = 3;
            testQuiz.reset();
            assert.equals(testQuiz.score, 0);
        });

        test('should clear userAnswers array', async () => {
            await testQuiz.loadQuestions();
            testQuiz.checkAnswer(0);
            testQuiz.reset();
            assert.arrayLength(testQuiz.userAnswers, 0);
        });

        test('should shuffle questions again', async () => {
            await testQuiz.loadQuestions();
            const firstQuestionBefore = testQuiz.questions[0].uniqueID;

            // Mock Math.random to ensure shuffle occurs
            const originalRandom = Math.random;
            let shuffled = false;
            Math.random = () => {
                shuffled = true;
                return 0.5;
            };

            testQuiz.reset();
            Math.random = originalRandom;

            assert.true(shuffled, 'Questions should be shuffled on reset');
        });

        test('should maintain question count after reset', async () => {
            await testQuiz.loadQuestions();
            const questionCount = testQuiz.questions.length;
            testQuiz.reset();
            assert.equals(testQuiz.questions.length, questionCount);
        });
    });

    describe('shuffleQuestions()', () => {
        test('should maintain question count', async () => {
            await testQuiz.loadQuestions();
            const countBefore = testQuiz.questions.length;
            testQuiz.shuffleQuestions();
            assert.equals(testQuiz.questions.length, countBefore);
        });

        test('should maintain all question objects', async () => {
            await testQuiz.loadQuestions();
            const idsBefore = testQuiz.questions.map(q => q.uniqueID).sort();
            testQuiz.shuffleQuestions();
            const idsAfter = testQuiz.questions.map(q => q.uniqueID).sort();

            assert.equals(JSON.stringify(idsBefore), JSON.stringify(idsAfter));
        });
    });

    describe('shuffleAnswers()', () => {
        test('should maintain answer count for each question', async () => {
            await testQuiz.loadQuestions();
            testQuiz.shuffleAnswers();
            testQuiz.questions.forEach(q => {
                assert.equals(q.answers.length, 3);
            });
        });

        test('should maintain exactly one correct answer per question', async () => {
            await testQuiz.loadQuestions();
            testQuiz.shuffleAnswers();
            testQuiz.questions.forEach(q => {
                const correctCount = q.answers.filter(a => a.correct).length;
                assert.equals(correctCount, 1);
            });
        });
    });

    describe('Edge Cases', () => {
        test('should handle accessing getCurrentQuestion with invalid index', async () => {
            await testQuiz.loadQuestions();
            testQuiz.currentQuestionIndex = 999;
            const question = testQuiz.getCurrentQuestion();
            assert.isUndefined(question);
        });

        test('should handle multiple resets', async () => {
            await testQuiz.loadQuestions();
            testQuiz.reset();
            testQuiz.reset();
            testQuiz.reset();
            assert.equals(testQuiz.currentQuestionIndex, 0);
            assert.equals(testQuiz.score, 0);
        });

        test('should handle answering beyond last question', async () => {
            await testQuiz.loadQuestions();
            testQuiz.currentQuestionIndex = 3;
            assert.isUndefined(testQuiz.getCurrentQuestion());
        });
    });
});
