/**
 * Configuration file for Google Sheets API integration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new OAuth 2.0 Client ID (or use existing):
 *    - Type: "Web application"
 *    - Authorized JavaScript origins: Add your domain (e.g., http://localhost:8080)
 * 3. Replace CLIENT_ID below with your Client ID
 * 4. Replace SPREADSHEET_ID with your Google Spreadsheet ID
 *    (found in the URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit)
 * 5. Adjust SHEET_RANGE if needed (e.g., "Sheet1!A1:Z100")
 */

const GOOGLE_SHEETS_CONFIG = {
    // Your OAuth 2.0 Client ID (safe to expose in client-side code)
    CLIENT_ID: '10403794794-rlfmdk3cl886klsge136d6ajta5utn5i.apps.googleusercontent.com',

    // Your Google Spreadsheet ID
    SPREADSHEET_ID: '18vn2RzA7s8XjkZJJPtAQ-9TEh9kTwj6upTMbSnoNnSQ',

    // The range to fetch from the spreadsheet (A1 notation)
    // Examples: "Sheet1!A1:Z100", "Sheet1", "Sheet1!A:Z"
    SHEET_RANGE: 'global!A1:Z10',

    // Google Sheets API scope (read-only for security)
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets.readonly',

    // Discovery doc for Google Sheets API v4
    DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',

    // API Key (optional - can be left empty)
    // If you create one, restrict it to Google Sheets API and your domain
    API_KEY: ''
};
