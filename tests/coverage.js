/**
 * Coverage Tracker
 * Tracks which methods were called during testing to calculate code coverage
 */

class CoverageTracker {
    constructor() {
        this.coverage = {
            Quiz: {
                methods: {},
                total: 0,
                covered: 0
            },
            QuizUI: {
                methods: {},
                total: 0,
                covered: 0
            }
        };

        this.quizMethods = [
            'loadQuestions',
            'shuffleQuestions',
            'shuffleAnswers',
            'getCurrentQuestion',
            'getTotalQuestions',
            'checkAnswer',
            'getCorrectAnswerIndex',
            'nextQuestion',
            'isComplete',
            'getScore',
            'getScorePercentage',
            'reset',
            'getCurrentQuestionNumber'
        ];

        this.uiMethods = [
            'initEventListeners',
            'startQuiz',
            'displayQuestion',
            'selectAnswer',
            'showFeedback',
            'handleNextQuestion',
            'updateProgress',
            'showResults',
            'restartQuiz',
            'showScreen',
            'startInactivityTimer',
            'clearInactivityTimer',
            'startAutoAdvanceTimer',
            'clearAutoAdvanceTimer',
            'resetToHome'
        ];

        this.initializeTracking();
    }

    initializeTracking() {
        // Check if classes are loaded
        if (typeof Quiz === 'undefined') {
            console.error('Quiz class not found! Make sure quiz.js is loaded before coverage.js');
            return;
        }
        if (typeof QuizUI === 'undefined') {
            console.error('QuizUI class not found! Make sure ui.js is loaded before coverage.js');
            return;
        }

        // Initialize Quiz methods
        this.quizMethods.forEach(method => {
            this.coverage.Quiz.methods[method] = false;
            this.coverage.Quiz.total++;
        });

        // Initialize QuizUI methods
        this.uiMethods.forEach(method => {
            this.coverage.QuizUI.methods[method] = false;
            this.coverage.QuizUI.total++;
        });

        // Wrap Quiz methods
        this.wrapClassMethods(Quiz, 'Quiz', this.quizMethods);

        // Wrap QuizUI methods
        this.wrapClassMethods(QuizUI, 'QuizUI', this.uiMethods);
    }

    wrapClassMethods(TargetClass, className, methods) {
        methods.forEach(methodName => {
            const original = TargetClass.prototype[methodName];
            if (original) {
                const tracker = this;
                TargetClass.prototype[methodName] = function(...args) {
                    tracker.markCovered(className, methodName);
                    return original.apply(this, args);
                };
            }
        });
    }

    markCovered(className, methodName) {
        if (this.coverage[className] && this.coverage[className].methods[methodName] === false) {
            this.coverage[className].methods[methodName] = true;
            this.coverage[className].covered++;
        }
    }

    calculateCoverage() {
        const quizCoverage = (this.coverage.Quiz.covered / this.coverage.Quiz.total) * 100;
        const uiCoverage = (this.coverage.QuizUI.covered / this.coverage.QuizUI.total) * 100;
        const totalCovered = this.coverage.Quiz.covered + this.coverage.QuizUI.covered;
        const totalMethods = this.coverage.Quiz.total + this.coverage.QuizUI.total;
        const overallCoverage = (totalCovered / totalMethods) * 100;

        return {
            quiz: quizCoverage,
            ui: uiCoverage,
            overall: overallCoverage,
            details: {
                quiz: {
                    covered: this.coverage.Quiz.covered,
                    total: this.coverage.Quiz.total,
                    methods: this.coverage.Quiz.methods
                },
                ui: {
                    covered: this.coverage.QuizUI.covered,
                    total: this.coverage.QuizUI.total,
                    methods: this.coverage.QuizUI.methods
                }
            }
        };
    }

    displayCoverage() {
        const results = this.calculateCoverage();

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('%c📊 Code Coverage Report', 'font-size: 16px; font-weight: bold; color: #9C27B0;');
        console.log('═══════════════════════════════════════════════════════\n');

        // Overall Coverage
        const overallColor = results.overall >= 80 ? '#4CAF50' : results.overall >= 60 ? '#FF9800' : '#f44336';
        console.log(`%c🎯 Overall Coverage: ${results.overall.toFixed(1)}%`, `color: ${overallColor}; font-weight: bold; font-size: 14px;`);
        console.log(`   Total Methods: ${results.details.quiz.total + results.details.ui.total}`);
        console.log(`   Covered: ${results.details.quiz.covered + results.details.ui.covered}`);
        console.log(`   Uncovered: ${(results.details.quiz.total + results.details.ui.total) - (results.details.quiz.covered + results.details.ui.covered)}\n`);

        // Quiz Class Coverage
        const quizColor = results.quiz >= 80 ? '#4CAF50' : results.quiz >= 60 ? '#FF9800' : '#f44336';
        console.log(`%c📦 Quiz Class: ${results.quiz.toFixed(1)}%`, `color: ${quizColor}; font-weight: bold;`);
        console.log(`   Covered: ${results.details.quiz.covered}/${results.details.quiz.total} methods`);

        const uncoveredQuiz = Object.entries(results.details.quiz.methods)
            .filter(([_, covered]) => !covered)
            .map(([method, _]) => method);

        if (uncoveredQuiz.length > 0) {
            console.log(`   %cUncovered methods:`, 'color: #f44336;');
            uncoveredQuiz.forEach(method => {
                console.log(`     %c✗ ${method}`, 'color: #f44336;');
            });
        } else {
            console.log(`   %c✓ All methods covered!`, 'color: #4CAF50;');
        }
        console.log('');

        // QuizUI Class Coverage
        const uiColor = results.ui >= 80 ? '#4CAF50' : results.ui >= 60 ? '#FF9800' : '#f44336';
        console.log(`%c📦 QuizUI Class: ${results.ui.toFixed(1)}%`, `color: ${uiColor}; font-weight: bold;`);
        console.log(`   Covered: ${results.details.ui.covered}/${results.details.ui.total} methods`);

        const uncoveredUI = Object.entries(results.details.ui.methods)
            .filter(([_, covered]) => !covered)
            .map(([method, _]) => method);

        if (uncoveredUI.length > 0) {
            console.log(`   %cUncovered methods:`, 'color: #f44336;');
            uncoveredUI.forEach(method => {
                console.log(`     %c✗ ${method}`, 'color: #f44336;');
            });
        } else {
            console.log(`   %c✓ All methods covered!`, 'color: #4CAF50;');
        }

        console.log('\n═══════════════════════════════════════════════════════');

        // Display in HTML
        this.displayHTMLCoverage(results);
    }

    displayHTMLCoverage(results) {
        const coverageContainer = document.getElementById('coverage-report');
        if (!coverageContainer) return;

        const overallClass = results.overall >= 80 ? 'excellent' : results.overall >= 60 ? 'good' : 'poor';
        const quizClass = results.quiz >= 80 ? 'excellent' : results.quiz >= 60 ? 'good' : 'poor';
        const uiClass = results.ui >= 80 ? 'excellent' : results.ui >= 60 ? 'good' : 'poor';

        const uncoveredQuiz = Object.entries(results.details.quiz.methods)
            .filter(([_, covered]) => !covered)
            .map(([method, _]) => method);

        const uncoveredUI = Object.entries(results.details.ui.methods)
            .filter(([_, covered]) => !covered)
            .map(([method, _]) => method);

        let html = `
            <h2>Code Coverage Report</h2>

            <div class="coverage-summary">
                <div class="coverage-item ${overallClass}">
                    <h3>Overall Coverage</h3>
                    <div class="coverage-percentage">${results.overall.toFixed(1)}%</div>
                    <div class="coverage-details">
                        ${results.details.quiz.covered + results.details.ui.covered} /
                        ${results.details.quiz.total + results.details.ui.total} methods
                    </div>
                </div>

                <div class="coverage-item ${quizClass}">
                    <h3>Quiz Class</h3>
                    <div class="coverage-percentage">${results.quiz.toFixed(1)}%</div>
                    <div class="coverage-details">
                        ${results.details.quiz.covered} / ${results.details.quiz.total} methods
                    </div>
                </div>

                <div class="coverage-item ${uiClass}">
                    <h3>QuizUI Class</h3>
                    <div class="coverage-percentage">${results.ui.toFixed(1)}%</div>
                    <div class="coverage-details">
                        ${results.details.ui.covered} / ${results.details.ui.total} methods
                    </div>
                </div>
            </div>
        `;

        if (uncoveredQuiz.length > 0 || uncoveredUI.length > 0) {
            html += '<div class="uncovered-methods"><h3>Uncovered Methods</h3>';

            if (uncoveredQuiz.length > 0) {
                html += `<div class="class-uncovered">
                    <h4>Quiz Class:</h4>
                    <ul>
                        ${uncoveredQuiz.map(m => `<li>✗ ${m}</li>`).join('')}
                    </ul>
                </div>`;
            }

            if (uncoveredUI.length > 0) {
                html += `<div class="class-uncovered">
                    <h4>QuizUI Class:</h4>
                    <ul>
                        ${uncoveredUI.map(m => `<li>✗ ${m}</li>`).join('')}
                    </ul>
                </div>`;
            }

            html += '</div>';
        } else {
            html += '<div class="all-covered">✓ All methods covered!</div>';
        }

        coverageContainer.innerHTML = html;
    }

    getDetailedReport() {
        const results = this.calculateCoverage();

        return `
╔════════════════════════════════════════════════════════╗
║           CODE COVERAGE REPORT                         ║
╚════════════════════════════════════════════════════════╝

Overall Coverage: ${results.overall.toFixed(1)}%
Target: 80%
Status: ${results.overall >= 80 ? '✓ PASSED' : '✗ BELOW TARGET'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quiz Class Coverage: ${results.quiz.toFixed(1)}%
Covered: ${results.details.quiz.covered}/${results.details.quiz.total} methods

QuizUI Class Coverage: ${results.ui.toFixed(1)}%
Covered: ${results.details.ui.covered}/${results.details.ui.total} methods

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
    }
}

// Create global coverage tracker
const coverageTracker = new CoverageTracker();

// Display coverage after tests complete
window.addEventListener('load', () => {
    setTimeout(() => {
        coverageTracker.displayCoverage();
        console.log(coverageTracker.getDetailedReport());
    }, 500);
});
