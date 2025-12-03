/**
 * Google Sheets API Integration
 * Handles authentication and data fetching from Google Sheets
 */

// Global variables
let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

/**
 * Initialize the Google API client library (gapi)
 */
function initializeGapiClient() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: GOOGLE_SHEETS_CONFIG.API_KEY || undefined,
                discoveryDocs: [GOOGLE_SHEETS_CONFIG.DISCOVERY_DOC]
            });
            gapiInited = true;
            updateSignInStatus();
            logMessage('Google API client initialized successfully', 'success');
        } catch (error) {
            logMessage('Error initializing Google API client: ' + error.message, 'error');
            console.error('GAPI initialization error:', error);
        }
    });
}

/**
 * Initialize the Google Identity Services (GIS) token client
 */
function initializeGisClient() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
            scope: GOOGLE_SHEETS_CONFIG.SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse.error !== undefined) {
                    logMessage('Authentication error: ' + tokenResponse.error, 'error');
                    throw tokenResponse;
                }
                accessToken = tokenResponse.access_token;
                logMessage('Successfully authenticated with Google!', 'success');
                updateSignInStatus();
            },
        });
        gisInited = true;
        updateSignInStatus();
        logMessage('Google Identity Services initialized successfully', 'success');
    } catch (error) {
        logMessage('Error initializing Google Identity Services: ' + error.message, 'error');
        console.error('GIS initialization error:', error);
    }
}

/**
 * Update UI based on sign-in status
 */
function updateSignInStatus() {
    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const fetchBtn = document.getElementById('fetch-data-btn');
    const statusText = document.getElementById('auth-status');

    if (accessToken) {
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'inline-block';
        fetchBtn.disabled = false;
        statusText.textContent = 'Authenticated ✓';
        statusText.className = 'auth-status authenticated';
    } else {
        signInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
        fetchBtn.disabled = true;
        statusText.textContent = gapiInited && gisInited ? 'Not authenticated' : 'Initializing...';
        statusText.className = 'auth-status not-authenticated';
    }

    // Enable sign-in button only when both libraries are initialized
    if (signInBtn && gapiInited && gisInited) {
        signInBtn.disabled = false;
    }
}

/**
 * Handle sign-in button click
 */
function handleSignIn() {
    if (!gapiInited || !gisInited) {
        logMessage('Please wait for initialization to complete', 'warning');
        return;
    }

    // Request an access token
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

/**
 * Handle sign-out button click
 */
function handleSignOut() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken, () => {
            logMessage('Successfully signed out', 'success');
        });
        accessToken = null;
        updateSignInStatus();
        clearResults();
    }
}

/**
 * Fetch data from the configured Google Spreadsheet
 */
async function fetchSheetData() {
    if (!accessToken) {
        logMessage('Please sign in first', 'warning');
        return;
    }

    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<div class="loading">Loading data from spreadsheet...</div>';

    try {
        logMessage('Fetching data from spreadsheet...', 'info');

        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
            range: GOOGLE_SHEETS_CONFIG.SHEET_RANGE,
        });

        const result = response.result;
        const values = result.values;

        logMessage(`Successfully fetched ${values ? values.length : 0} rows`, 'success');

        // Display the formatted JSON response
        displayResults(result);

    } catch (error) {
        logMessage('Error fetching sheet data: ' + error.message, 'error');
        console.error('Fetch error:', error);
        displayError(error);
    }
}

/**
 * Display the API response in a formatted way
 */
function displayResults(data) {
    const resultsContainer = document.getElementById('results-container');

    // Create a formatted JSON display
    const formattedJSON = JSON.stringify(data, null, 2);

    resultsContainer.innerHTML = `
        <div class="result-section">
            <h3>API Response:</h3>
            <div class="json-display">
                <pre><code>${escapeHtml(formattedJSON)}</code></pre>
            </div>
        </div>
        <div class="result-section">
            <h3>Data Summary:</h3>
            <ul>
                <li><strong>Range:</strong> ${data.range || 'N/A'}</li>
                <li><strong>Major Dimension:</strong> ${data.majorDimension || 'N/A'}</li>
                <li><strong>Rows:</strong> ${data.values ? data.values.length : 0}</li>
                <li><strong>Columns:</strong> ${data.values && data.values.length > 0 ? data.values[0].length : 0}</li>
            </ul>
        </div>
        ${data.values ? `
        <div class="result-section">
            <h3>Data Preview (first 5 rows):</h3>
            <div class="table-container">
                <table>
                    ${generateTableHTML(data.values.slice(0, 5))}
                </table>
            </div>
        </div>
        ` : ''}
    `;
}

/**
 * Display error information
 */
function displayError(error) {
    const resultsContainer = document.getElementById('results-container');

    resultsContainer.innerHTML = `
        <div class="error-display">
            <h3>Error Details:</h3>
            <p><strong>Message:</strong> ${error.message || 'Unknown error'}</p>
            <p><strong>Status:</strong> ${error.status || 'N/A'}</p>
            ${error.result ? `
                <h4>Error Response:</h4>
                <pre><code>${escapeHtml(JSON.stringify(error.result, null, 2))}</code></pre>
            ` : ''}
        </div>
    `;
}

/**
 * Generate HTML table from array data
 */
function generateTableHTML(rows) {
    if (!rows || rows.length === 0) {
        return '<tr><td>No data</td></tr>';
    }

    let html = '<thead><tr>';
    // First row as header
    rows[0].forEach(cell => {
        html += `<th>${escapeHtml(String(cell))}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Remaining rows as data
    for (let i = 1; i < rows.length; i++) {
        html += '<tr>';
        rows[i].forEach(cell => {
            html += `<td>${escapeHtml(String(cell || ''))}</td>`;
        });
        html += '</tr>';
    }
    html += '</tbody>';

    return html;
}

/**
 * Clear the results display
 */
function clearResults() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p class="empty-state">No data loaded yet. Sign in and click "Fetch Data" to get started.</p>';
}

/**
 * Log a message to the log container
 */
function logMessage(message, type = 'info') {
    const logContainer = document.getElementById('log-container');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-message">${escapeHtml(message)}</span>`;
    logContainer.appendChild(logEntry);

    // Auto-scroll to latest log
    logContainer.scrollTop = logContainer.scrollHeight;

    // Keep only last 50 log entries
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize the page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if config is set up
    if (GOOGLE_SHEETS_CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID_HERE')) {
        logMessage('WARNING: Please configure your CLIENT_ID in config.js', 'error');
        alert('Please configure your Google API credentials in js/config.js before using this test page.');
        return;
    }

    if (GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID.includes('YOUR_SPREADSHEET_ID_HERE')) {
        logMessage('WARNING: Please configure your SPREADSHEET_ID in config.js', 'error');
        alert('Please configure your Spreadsheet ID in js/config.js before using this test page.');
        return;
    }

    logMessage('Starting initialization...', 'info');
    logMessage('Client ID: ' + GOOGLE_SHEETS_CONFIG.CLIENT_ID.substring(0, 20) + '...', 'info');
    logMessage('Spreadsheet ID: ' + GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID.substring(0, 20) + '...', 'info');

    // Set up event listeners
    document.getElementById('sign-in-btn').addEventListener('click', handleSignIn);
    document.getElementById('sign-out-btn').addEventListener('click', handleSignOut);
    document.getElementById('fetch-data-btn').addEventListener('click', fetchSheetData);

    // Initialize display
    updateSignInStatus();
    clearResults();
});
