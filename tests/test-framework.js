/**
 * Simple Test Framework for AstroQuiz
 * A lightweight testing library for browser-based testing
 */

class TestFramework {
    constructor() {
        this.tests = [];
        this.currentSuite = null;
        this.suiteStack = []; // Track nested suites
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.suites = [];
    }

    describe(suiteName, fn) {
        const parentSuite = this.currentSuite;
        const suite = {
            name: suiteName,
            tests: [],
            beforeEach: null,
            afterEach: null,
            parent: parentSuite
        };
        this.suites.push(suite);
        this.suiteStack.push(suite);
        this.currentSuite = suite;
        fn();
        this.suiteStack.pop();
        this.currentSuite = parentSuite;
    }

    beforeEach(fn) {
        if (this.currentSuite) {
            this.currentSuite.beforeEach = fn;
        }
    }

    afterEach(fn) {
        if (this.currentSuite) {
            this.currentSuite.afterEach = fn;
        }
    }

    test(testName, fn) {
        const testCase = {
            name: testName,
            fn: fn,
            suite: this.currentSuite
        };

        if (this.currentSuite) {
            this.currentSuite.tests.push(testCase);
        }
        this.tests.push(testCase);
    }

    // Helper to collect all beforeEach hooks from suite hierarchy
    getBeforeEachHooks(suite) {
        const hooks = [];
        let current = suite;
        while (current) {
            if (current.beforeEach) {
                hooks.unshift(current.beforeEach); // Add parent hooks first
            }
            current = current.parent;
        }
        return hooks;
    }

    // Helper to collect all afterEach hooks from suite hierarchy
    getAfterEachHooks(suite) {
        const hooks = [];
        let current = suite;
        while (current) {
            if (current.afterEach) {
                hooks.push(current.afterEach); // Add child hooks first
            }
            current = current.parent;
        }
        return hooks;
    }

    async runTests() {
        console.log('%c🚀 Starting Test Run...', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
        console.log('═══════════════════════════════════════════════════════\n');

        for (const suite of this.suites) {
            console.log(`%c📦 ${suite.name}`, 'font-size: 14px; font-weight: bold; color: #2196F3;');

            for (const test of suite.tests) {
                this.results.total++;

                try {
                    // Run all beforeEach hooks (parent to child)
                    const beforeHooks = this.getBeforeEachHooks(suite);
                    for (const hook of beforeHooks) {
                        hook();
                    }

                    // Run the test
                    await test.fn();

                    // Run all afterEach hooks (child to parent)
                    const afterHooks = this.getAfterEachHooks(suite);
                    for (const hook of afterHooks) {
                        hook();
                    }

                    this.results.passed++;
                    console.log(`  %c✓ ${test.name}`, 'color: #4CAF50;');
                    this.displayTestResult(test.name, true);
                } catch (error) {
                    this.results.failed++;
                    console.error(`  %c✗ ${test.name}`, 'color: #f44336;');
                    console.error(`    Error: ${error.message}`);
                    if (error.stack) {
                        console.error(`    ${error.stack}`);
                    }
                    this.displayTestResult(test.name, false, error.message);
                }
            }
            console.log(''); // Empty line between suites
        }

        this.displaySummary();
    }

    displayTestResult(testName, passed, errorMessage = '') {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;

        const testDiv = document.createElement('div');
        testDiv.className = `test-result ${passed ? 'passed' : 'failed'}`;
        testDiv.innerHTML = `
            <span class="test-icon">${passed ? '✓' : '✗'}</span>
            <span class="test-name">${testName}</span>
            ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ''}
        `;
        resultsContainer.appendChild(testDiv);
    }

    displaySummary() {
        const percentage = ((this.results.passed / this.results.total) * 100).toFixed(1);
        const passed = this.results.failed === 0;

        console.log('═══════════════════════════════════════════════════════');
        console.log(`%c📊 Test Summary`, 'font-size: 16px; font-weight: bold;');
        console.log(`   Total:  ${this.results.total}`);
        console.log(`   %cPassed: ${this.results.passed}`, 'color: #4CAF50; font-weight: bold;');
        console.log(`   %cFailed: ${this.results.failed}`, 'color: #f44336; font-weight: bold;');
        console.log(`   Success Rate: ${percentage}%`);
        console.log('═══════════════════════════════════════════════════════\n');

        const summaryContainer = document.getElementById('test-summary');
        if (summaryContainer) {
            summaryContainer.className = passed ? 'summary passed' : 'summary failed';
            summaryContainer.innerHTML = `
                <h2>${passed ? '✓ All Tests Passed!' : '✗ Some Tests Failed'}</h2>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-label">Total:</span>
                        <span class="stat-value">${this.results.total}</span>
                    </div>
                    <div class="stat passed">
                        <span class="stat-label">Passed:</span>
                        <span class="stat-value">${this.results.passed}</span>
                    </div>
                    <div class="stat failed">
                        <span class="stat-label">Failed:</span>
                        <span class="stat-value">${this.results.failed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Success Rate:</span>
                        <span class="stat-value">${percentage}%</span>
                    </div>
                </div>
            `;
        }
    }

    reset() {
        this.tests = [];
        this.suites = [];
        this.currentSuite = null;
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
}

// Assertion library
class Assert {
    equals(actual, expected, message = '') {
        if (actual !== expected) {
            const msg = message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`;
            throw new Error(msg);
        }
    }

    notEquals(actual, expected, message = '') {
        if (actual === expected) {
            const msg = message || `Expected values to be different, but both were ${JSON.stringify(actual)}`;
            throw new Error(msg);
        }
    }

    true(value, message = '') {
        if (value !== true) {
            const msg = message || `Expected true, but got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    false(value, message = '') {
        if (value !== false) {
            const msg = message || `Expected false, but got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    truthy(value, message = '') {
        if (!value) {
            const msg = message || `Expected truthy value, but got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    falsy(value, message = '') {
        if (value) {
            const msg = message || `Expected falsy value, but got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    isNull(value, message = '') {
        if (value !== null) {
            const msg = message || `Expected null, but got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    isNotNull(value, message = '') {
        if (value === null) {
            const msg = message || `Expected non-null value, but got null`;
            throw new Error(msg);
        }
    }

    isUndefined(value, message = '') {
        if (value !== undefined) {
            const msg = message || `Expected undefined, but got ${JSON.stringify(value)}`;
            throw new Error(msg);
        }
    }

    isDefined(value, message = '') {
        if (value === undefined) {
            const msg = message || `Expected defined value, but got undefined`;
            throw new Error(msg);
        }
    }

    arrayContains(array, item, message = '') {
        if (!Array.isArray(array)) {
            throw new Error('First argument must be an array');
        }
        if (!array.includes(item)) {
            const msg = message || `Expected array to contain ${JSON.stringify(item)}`;
            throw new Error(msg);
        }
    }

    arrayLength(array, length, message = '') {
        if (!Array.isArray(array)) {
            throw new Error('First argument must be an array');
        }
        if (array.length !== length) {
            const msg = message || `Expected array length ${length}, but got ${array.length}`;
            throw new Error(msg);
        }
    }

    objectHasProperty(obj, property, message = '') {
        if (!obj.hasOwnProperty(property)) {
            const msg = message || `Expected object to have property "${property}"`;
            throw new Error(msg);
        }
    }

    throws(fn, message = '') {
        let thrown = false;
        try {
            fn();
        } catch (e) {
            thrown = true;
        }
        if (!thrown) {
            const msg = message || 'Expected function to throw an error';
            throw new Error(msg);
        }
    }

    async rejects(promise, message = '') {
        let rejected = false;
        try {
            await promise;
        } catch (e) {
            rejected = true;
        }
        if (!rejected) {
            const msg = message || 'Expected promise to reject';
            throw new Error(msg);
        }
    }
}

// Create global instances
const testFramework = new TestFramework();
const assert = new Assert();

// Export global functions
const describe = testFramework.describe.bind(testFramework);
const test = testFramework.test.bind(testFramework);
const beforeEach = testFramework.beforeEach.bind(testFramework);
const afterEach = testFramework.afterEach.bind(testFramework);

// Auto-run tests when all scripts are loaded
window.addEventListener('load', async () => {
    // Small delay to ensure all test files are loaded
    setTimeout(async () => {
        await testFramework.runTests();
    }, 100);
});
