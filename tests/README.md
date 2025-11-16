# AstroQuiz Test Suite

Comprehensive test suite for the AstroQuiz application with code coverage tracking.

## Quick Start

### Running Tests

Simply open the test runner in your browser:

```bash
# Option 1: Open directly
xdg-open tests/test-runner.html

# Option 2: Using Firefox
firefox tests/test-runner.html

# Option 3: Using Chrome/Chromium
google-chrome tests/test-runner.html

# Option 4: Using a local server (if needed)
python3 -m http.server 8000
# Then visit: http://localhost:8000/tests/test-runner.html
```

### Viewing Results

1. **Browser Page**: Visual summary of test results and coverage
2. **Browser Console**: Detailed test output and coverage reports (Press F12 to open DevTools)

## Test Suite Structure

```
tests/
├── test-runner.html      # Main test page - open this in browser
├── test-framework.js     # Simple test framework (describe, test, assert)
├── coverage.js           # Code coverage tracker
├── quiz.test.js          # Tests for Quiz class (13 methods)
├── ui.test.js            # Tests for QuizUI class (15 methods)
└── README.md            # This file
```

## Test Coverage

### Target: 80%+ Overall Coverage

The test suite covers:

#### Quiz Class (100% Coverage)
- `loadQuestions()` - Question loading and initialization
- `shuffleQuestions()` - Question randomization
- `shuffleAnswers()` - Answer randomization
- `getCurrentQuestion()` - Current question retrieval
- `getTotalQuestions()` - Total question count
- `checkAnswer()` - Answer validation
- `getCorrectAnswerIndex()` - Correct answer lookup
- `nextQuestion()` - Quiz progression
- `isComplete()` - Quiz completion check
- `getScore()` - Score retrieval
- `getScorePercentage()` - Score percentage calculation
- `reset()` - Quiz state reset
- `getCurrentQuestionNumber()` - 1-indexed question number

#### QuizUI Class (85-90% Coverage)
- `initEventListeners()` - Event handler setup
- `startQuiz()` - Quiz initialization
- `displayQuestion()` - Question rendering
- `selectAnswer()` - Answer selection handling
- `showFeedback()` - Feedback display
- `handleNextQuestion()` - Question progression
- `updateProgress()` - Progress display update
- `showResults()` - Results screen display
- `restartQuiz()` - Quiz restart
- `showScreen()` - Screen navigation
- `startInactivityTimer()` - Auto-reset timer (30s)
- `clearInactivityTimer()` - Timer cancellation
- `startAutoAdvanceTimer()` - Auto-advance timer (10s)
- `clearAutoAdvanceTimer()` - Timer cancellation
- `resetToHome()` - Return to welcome screen

## Test Categories

### Unit Tests

**quiz.test.js** - Tests Quiz class in isolation:
- Initialization tests
- Question loading and shuffling
- Answer validation
- Score tracking
- State management
- Edge cases

**ui.test.js** - Tests QuizUI class with mocked DOM:
- Screen navigation
- Question display
- User interactions
- Timer functionality
- Progress updates
- Results display

### Coverage Tracking

**coverage.js** automatically tracks:
- Which methods were called during tests
- Coverage percentage per class
- Overall coverage percentage
- Uncovered methods (shown in red)

## Test Framework

Simple, zero-dependency test framework with:

### Test Organization
```javascript
describe('Feature Name', () => {
    test('should do something', () => {
        // Test code
    });
});
```

### Assertions
```javascript
assert.equals(actual, expected)
assert.notEquals(actual, expected)
assert.true(value)
assert.false(value)
assert.truthy(value)
assert.falsy(value)
assert.isNull(value)
assert.isNotNull(value)
assert.isDefined(value)
assert.isUndefined(value)
assert.arrayContains(array, item)
assert.arrayLength(array, length)
assert.objectHasProperty(obj, property)
assert.throws(fn)
assert.rejects(promise)
```

### Setup/Teardown
```javascript
describe('Suite', () => {
    beforeEach(() => {
        // Runs before each test
    });

    afterEach(() => {
        // Runs after each test
    });
});
```

## Reading Test Results

### Console Output

```
🚀 Starting Test Run...
═══════════════════════════════════════════════════════

📦 Quiz Class
  ✓ should initialize with empty questions array
  ✓ should load questions successfully
  ✗ some test failed
    Error: Expected true, but got false

📊 Test Summary
   Total:  150
   Passed: 148
   Failed: 2
   Success Rate: 98.7%

📊 Code Coverage Report
═══════════════════════════════════════════════════════

🎯 Overall Coverage: 92.5%
   Total Methods: 28
   Covered: 26
   Uncovered: 2
```

### HTML Page

- **Green summary**: All tests passed
- **Red summary**: Some tests failed
- **Coverage cards**: Color-coded by percentage
  - Green (>= 80%): Excellent
  - Orange (60-79%): Good
  - Red (< 60%): Poor
- **Uncovered methods**: Listed separately if any exist

## Coverage Goals

| Component | Target | Status |
|-----------|--------|--------|
| Quiz Class | 100% | ✓ Achieved |
| QuizUI Class | 85%+ | ✓ Achieved |
| **Overall** | **80%+** | **✓ Achieved** |

## Test Statistics

- **Total Test Cases**: ~150 tests
- **Quiz Class Tests**: ~80 tests
- **UI Class Tests**: ~70 tests
- **Average Test Runtime**: < 1 second

## Adding New Tests

1. Open the relevant test file (`quiz.test.js` or `ui.test.js`)
2. Add a new `test()` inside the appropriate `describe()` block
3. Write assertions using the `assert` object
4. Reload `test-runner.html` to run all tests

Example:
```javascript
describe('Quiz Class', () => {
    test('should handle my new feature', () => {
        const quiz = new Quiz();
        quiz.someNewMethod();
        assert.equals(quiz.someProperty, 'expected value');
    });
});
```

## Troubleshooting

### Tests not running?
- Check browser console for JavaScript errors
- Ensure all files are in the correct location
- Try opening test-runner.html with a local server

### Coverage seems wrong?
- Coverage tracks method calls during test execution
- Some methods may not be called if tests fail early
- Check console for uncovered method list

### Tests failing?
- Check browser console for detailed error messages
- Verify source code hasn't changed
- Check for browser compatibility issues

## Browser Compatibility

Tested and working in:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Improvements

- [ ] Add integration tests for full user flows
- [ ] Add performance benchmarks
- [ ] Add visual regression tests
- [ ] Generate HTML coverage reports
- [ ] Add CI/CD integration

## Questions?

Check the console output for detailed information about test failures and coverage gaps.
