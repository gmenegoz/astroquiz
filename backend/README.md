# AstroQuiz Backend API

Backend API for the AstroQuiz application, providing Google Sheets integration for quiz persistence.

## Architecture

- **Platform:** Vercel Serverless Functions
- **Language:** Node.js
- **Database:** Google Sheets via Service Account
- **Authentication:** Google Service Account (no user login required)

## Prerequisites

1. Node.js 18+ installed locally for development
2. Google Cloud Project with Sheets API enabled
3. Google Service Account with JSON key file
4. Vercel CLI installed (`npm install -g vercel`)

## Setup Instructions

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**
4. Create a **Service Account**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "astroquiz-backend")
   - Click "Create and Continue"
   - Skip role assignment (click "Continue")
   - Click "Done"
5. Create a **JSON key** for the Service Account:
   - Click on the newly created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Download the key file (keep it secret!)

### 2. Google Sheets Setup

1. Open your Google Spreadsheet
2. Share it with the Service Account email (`astroquiz-backend@astroquiz-479816.iam.gserviceaccount.com`)
3. Give it "Editor" permissions
4. Create 4 sheets with these exact names and structures:

#### Sheet: `questions`
```
| questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex |
|------------|----------|---------|---------|---------|-------------------|
| q1         | ...      | ...     | ...     | ...     | 0                 |
```

#### Sheet: `sessions`
```
| sessionID | timestamp_start | timestamp_end | status | final_score | total_questions | percentage |
|-----------|----------------|---------------|--------|-------------|-----------------|------------|
| ...       | ...            | ...           | ...    | ...         | ...             | ...        |
```

#### Sheet: `answer_stats`
```
| questionID | answer0_count | answer1_count | answer2_count | total_responses |
|------------|---------------|---------------|---------------|-----------------|
| ...        | ...           | ...           | ...           | ...             |
```

#### Sheet: `score_distribution`
```
| score | count |
|-------|-------|
| 0     | 5     |
| 1     | 12    |
| ...   | ...   |
```

### 3. Local Development Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` and add your credentials:
   ```env
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
   GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
   ```

6. Start local development server:
   ```bash
   npm run dev
   ```

7. Test the API:
   ```bash
   curl http://localhost:3000/api/get-questions
   ```

### 4. Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `GOOGLE_SERVICE_ACCOUNT_JSON` (paste the entire JSON)
   - Add `GOOGLE_SPREADSHEET_ID`

5. Deploy to production:
   ```bash
   vercel --prod
   ```

6. Note your production URL (e.g., `https://your-project.vercel.app`)

## API Endpoints

### GET `/api/get-questions`

Returns all quiz questions.

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "q1",
      "question": "What is a comet?",
      "answers": ["Ice ball", "Rock", "Gas cloud"],
      "correctIndex": 0
    }
  ],
  "total": 10
}
```

### POST `/api/start-session`

Creates a new quiz session.

**Request:** Empty body `{}`

**Response:**
```json
{
  "success": true,
  "sessionID": "uuid-123",
  "timestamp": "2025-12-02T10:30:00Z"
}
```

### POST `/api/record-answer`

Records a user's answer and returns statistics.

**Request:**
```json
{
  "sessionID": "uuid-123",
  "questionID": "q1",
  "selectedAnswerIndex": 1
}
```

**Response:**
```json
{
  "success": true,
  "correct": false,
  "correctAnswerIndex": 0,
  "statistics": {
    "totalResponses": 245,
    "correctPercentage": 78.4,
    "answerDistribution": [192, 35, 18]
  }
}
```

### POST `/api/complete-session`

Marks a session as completed.

**Request:**
```json
{
  "sessionID": "uuid-123",
  "finalScore": 8,
  "totalQuestions": 10
}
```

**Response:**
```json
{
  "success": true,
  "sessionID": "uuid-123",
  "finalScore": 8,
  "totalQuestions": 10,
  "percentage": 80,
  "timestamp": "2025-12-02T10:45:00Z"
}
```

### POST `/api/abandon-session`

Marks a session as abandoned.

**Request:**
```json
{
  "sessionID": "uuid-123"
}
```

**Response:**
```json
{
  "success": true,
  "sessionID": "uuid-123",
  "status": "abandoned"
}
```

### GET `/api/get-score-distribution`

Returns score distribution for visualization.

**Response:**
```json
{
  "success": true,
  "distribution": [
    {"score": 0, "count": 5},
    {"score": 1, "count": 12},
    {"score": 10, "count": 45}
  ],
  "statistics": {
    "totalResponses": 150,
    "averageScore": 7.2
  }
}
```

## Project Structure

```
backend/
├── api/
│   ├── get-questions.js           # GET quiz questions
│   ├── start-session.js           # POST create session
│   ├── record-answer.js           # POST record answer
│   ├── complete-session.js        # POST complete session
│   ├── abandon-session.js         # POST abandon session
│   └── get-score-distribution.js  # GET score distribution
├── lib/
│   └── sheets-client.js           # Google Sheets helper
├── package.json
├── vercel.json                    # Vercel configuration
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Local Testing

The API will be available at `http://localhost:3000` when running `npm run dev`.

## Troubleshooting

### "Failed to authenticate with Google Sheets"

- Check that `GOOGLE_SERVICE_ACCOUNT_JSON` is properly formatted JSON
- Verify the Service Account has access to the spreadsheet
- Make sure the Sheets API is enabled in your Google Cloud project

### "Spreadsheet ID not configured"

- Set `GOOGLE_SPREADSHEET_ID` environment variable
- Get the ID from your spreadsheet URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`

### "Question not found" or "Session not found"

- Check that your sheet names match exactly: `questions`, `sessions`, `answer_stats`, `score_distribution`
- Verify the sheet structure matches the expected format
- Check that there are no extra spaces in column headers

### CORS Issues

- Add your frontend domain to `ALLOWED_ORIGINS` environment variable
- Format: `https://yourdomain.github.io,http://localhost:8080`

## Security Notes

- **Never commit the Service Account JSON key** to version control
- Use environment variables for all sensitive data
- The Service Account email is not sensitive (it's just an identifier)
- Restrict Spreadsheet access to only the Service Account
- Consider using Vercel's secret management for production

## License

MIT
