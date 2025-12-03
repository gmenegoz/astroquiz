# 🌟 AstroQuiz - Interactive Astronomy Quiz

An interactive astronomy quiz application for museum exhibitions, featuring real-time statistics, score tracking, and data persistence via Google Sheets.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Deployment](#deployment)
- [Usage](#usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### User Experience
- 🎯 Interactive quiz with multiple-choice questions
- 📊 Real-time answer statistics ("X% of people answered correctly")
- 📈 Score distribution visualization with charts
- ⏱️ Auto-advance and inactivity timeout for museum kiosks
- 🎨 Beautiful cosmic theme matching exhibition aesthetics
- 📱 Responsive design for various screen sizes

### Data & Analytics
- 💾 Persistent data storage via Google Sheets
- 📉 Track quiz sessions (completed/abandoned)
- 📊 Answer statistics per question
- 📈 Score distribution across all users
- 🔍 Non-technical staff can view/export data easily

### Technical
- 🚀 Serverless backend (Vercel)
- 🔐 Service Account authentication (no user login needed)
- 🌐 Static frontend (GitHub Pages compatible)
- ✅ Comprehensive test suite
- 📝 Full documentation

## 🏗️ Architecture

```
┌─────────────────┐
│  GitHub Pages   │  ← Frontend (HTML/CSS/JS)
│  (Frontend)     │
└────────┬────────┘
         │ API Calls
         ↓
┌─────────────────┐
│     Vercel      │  ← Backend (Serverless Functions)
│   (Backend)     │
└────────┬────────┘
         │ Service Account
         ↓
┌─────────────────┐
│ Google Sheets   │  ← Database (4 sheets)
│  (Database)     │
└─────────────────┘
```

### Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js for visualizations
- No build step required

**Backend:**
- Node.js 18+
- Vercel Serverless Functions
- Google Sheets API
- UUID for session IDs

**Database:**
- Google Sheets (4 sheets: questions, sessions, answer_stats, score_distribution)

## 🚀 Quick Start

### Prerequisites

1. Node.js 18+ installed
2. Git installed
3. Google account
4. Vercel account (free tier)
5. GitHub account (for Pages deployment)

### Quick Setup (5 minutes)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd astroquiz
   ```

2. **Set up Google Sheets:**
   - Follow: [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md)
   - Create spreadsheet with 4 sheets
   - Get Service Account credentials

3. **Deploy backend to Vercel:**
   ```bash
   cd backend
   npm install
   vercel
   ```

4. **Configure frontend:**
   ```javascript
   // js/api-config.js
   BASE_URL: 'https://your-vercel-deployment.vercel.app'
   ```

5. **Deploy frontend to GitHub Pages:**
   ```bash
   git add .
   git commit -m "Deploy AstroQuiz"
   git push origin main
   # Enable GitHub Pages in repository settings
   ```

6. **Test it!**
   - Open your GitHub Pages URL
   - Start a quiz
   - Check Google Sheets for data

## 📖 Detailed Setup

### 1. Google Cloud & Sheets Setup

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "AstroQuiz"
4. Click "Create"

#### Step 2: Enable Google Sheets API

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and click "Enable"

#### Step 3: Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `astroquiz-backend`
4. Description: "Service account for AstroQuiz backend"
5. Click "Create and Continue"
6. Skip role assignment (click "Continue")
7. Click "Done"

#### Step 4: Generate JSON Key

1. Click on the newly created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON"
5. Click "Create"
6. **Save the downloaded JSON file securely** (you'll need it later)

#### Step 5: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "AstroQuiz Data"
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

#### Step 6: Share Spreadsheet with Service Account

1. Open the JSON key file you downloaded
2. Find the `client_email` field (looks like `xxx@yyy.iam.gserviceaccount.com`)
3. Copy this email
4. In your Google Sheet, click "Share"
5. Paste the service account email
6. Give it "Editor" permissions
7. Uncheck "Notify people" (it's a bot, not a person!)
8. Click "Share"

#### Step 7: Create Sheet Structure

Create 4 sheets with these exact names:

**Sheet 1: `questions`**
| questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex |
|------------|----------|---------|---------|---------|-------------------|
| q1 | Chi ha inventato il cannocchiale? | Galileo Galilei | Paolo Antoniazzi | Qualcun altro | 2 |
| q2 | Cosa succede durante una congiunzione? | Si fondono | Sembrano vicini | Anima gemella | 1 |

**Sheet 2: `sessions`**
| sessionID | timestamp_start | timestamp_end | status | final_score | total_questions | percentage |
|-----------|----------------|---------------|--------|-------------|-----------------|------------|

(Leave empty, will be populated automatically)

**Sheet 3: `answer_stats`**
| questionID | answer0_count | answer1_count | answer2_count | total_responses |
|------------|---------------|---------------|---------------|-----------------|

(Leave empty, will be populated automatically)

**Sheet 4: `score_distribution`**
| score | count |
|-------|-------|

(Leave empty, will be populated automatically)

### 2. Backend Setup & Deployment

#### Local Development

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env`:**
   ```env
   # Open your Service Account JSON key file and copy the ENTIRE content
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}

   # Your Spreadsheet ID from the URL
   GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
   ```

5. **Test locally:**
   ```bash
   npm run dev
   ```

6. **Test API endpoint:**
   ```bash
   curl http://localhost:3000/api/get-questions
   ```

#### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy (first time):**
   ```bash
   vercel
   ```
   - Answer the prompts:
     - Set up and deploy? **Yes**
     - Which scope? Select your account
     - Link to existing project? **No**
     - Project name? **astroquiz-backend**
     - Directory? **./backend** or **.**
     - Want to modify settings? **No**

4. **Add environment variables in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Select your project
   - Go to "Settings" → "Environment Variables"
   - Add:
     - `GOOGLE_SERVICE_ACCOUNT_JSON`: Paste the entire JSON from your key file
     - `GOOGLE_SPREADSHEET_ID`: Your spreadsheet ID

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

6. **Note your production URL:**
   ```
   https://astroquiz-backend-xxx.vercel.app
   ```

### 3. Frontend Setup & Deployment

#### Configure API URL

1. **Edit `js/api-config.js`:**
   ```javascript
   const API_CONFIG = {
       BASE_URL: 'https://your-vercel-url.vercel.app', // ← Change this!
       // ... rest of config
   };
   ```

#### Deploy to GitHub Pages

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Source: "Deploy from a branch"
   - Branch: `main` / `root`
   - Click "Save"

3. **Wait 1-2 minutes for deployment**

4. **Access your quiz:**
   ```
   https://yourusername.github.io/astroquiz
   ```

#### Alternative: Deploy to Vercel (Frontend + Backend)

If you want everything on Vercel:

1. Create `vercel.json` in root:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "backend/api/**/*.js", "use": "@vercel/node" },
       { "src": "**/*.html", "use": "@vercel/static" },
       { "src": "**/*.{css,js,png,jpg,svg}", "use": "@vercel/static" }
     ]
   }
   ```

2. Deploy entire project:
   ```bash
   vercel --prod
   ```

## 🎮 Usage

### For Museum Staff

#### Viewing Quiz Data

1. Open your Google Spreadsheet
2. Select the sheet you want to view:
   - **questions**: Quiz questions and answers
   - **sessions**: All quiz attempts
   - **answer_stats**: How many people selected each answer
   - **score_distribution**: Distribution of final scores

#### Exporting Data

1. File → Download → CSV or Excel
2. Or use built-in Google Sheets charts/pivot tables

#### Editing Questions

1. Open `questions` sheet
2. Edit cells directly
3. Changes take effect immediately (no deployment needed!)

### For Visitors

1. Open the quiz URL
2. Click "Inizia il Quiz"
3. Read question and select an answer
4. View feedback with statistics
5. Complete all questions
6. See your score and distribution chart

### For Developers

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for:
- Running tests
- Adding new features
- API documentation
- Contributing guidelines

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
# Open in browser
open tests/test-runner.html
```

### Manual Testing Checklist

- [ ] Load questions from API
- [ ] Start session successfully
- [ ] Record answers and see statistics
- [ ] Complete session and save score
- [ ] Abandon session (refresh page mid-quiz)
- [ ] View score distribution chart
- [ ] Check Google Sheets for recorded data

## 🐛 Troubleshooting

### Frontend Issues

#### "Failed to load questions"
- Check that `BASE_URL` in `js/api-config.js` is correct
- Verify backend is deployed and running
- Check browser console for CORS errors

#### "No statistics showing"
- Statistics only appear after multiple people take the quiz
- Check that `answer_stats` sheet exists in Google Sheets

#### Chart not displaying
- Check that Chart.js is loading (look for 404 errors in console)
- Verify `score_distribution` sheet has data

### Backend Issues

#### "Failed to authenticate with Google Sheets"
- Verify `GOOGLE_SERVICE_ACCOUNT_JSON` is valid JSON
- Check that Service Account email has access to the spreadsheet
- Ensure Sheets API is enabled in Google Cloud

#### "Spreadsheet ID not configured"
- Set `GOOGLE_SPREADSHEET_ID` environment variable in Vercel
- Verify the ID matches your spreadsheet

#### "Sheet not found" errors
- Check that sheet names are exactly: `questions`, `sessions`, `answer_stats`, `score_distribution`
- Sheet names are case-sensitive!

### CORS Errors

If you see CORS errors in browser console:

1. Add your frontend domain to backend environment variables:
   ```env
   ALLOWED_ORIGINS=https://yourusername.github.io,http://localhost:8080
   ```

2. Redeploy backend:
   ```bash
   vercel --prod
   ```

## 📁 Project Structure

```
astroquiz/
├── backend/                      # Backend API
│   ├── api/                      # Serverless functions
│   │   ├── get-questions.js
│   │   ├── start-session.js
│   │   ├── record-answer.js
│   │   ├── complete-session.js
│   │   ├── abandon-session.js
│   │   └── get-score-distribution.js
│   ├── lib/
│   │   └── sheets-client.js      # Google Sheets helper
│   ├── package.json
│   ├── vercel.json
│   └── README.md
├── css/
│   └── style.css                 # Styles
├── js/
│   ├── api-config.js             # API configuration
│   ├── quiz.js                   # Quiz logic
│   └── ui.js                     # UI controller
├── tests/
│   └── test-runner.html          # Test suite
├── docs/
│   ├── GOOGLE_SHEETS_SETUP.md    # Detailed Sheets guide
│   └── DEVELOPMENT.md            # Development guide
├── index.html                    # Main quiz page
├── sheets-test.html              # API test page (can be removed)
└── README.md                     # This file
```

## 🔐 Security Notes

- ✅ Service Account credentials stored in environment variables only
- ✅ No client secret in frontend code
- ✅ Spreadsheet only accessible to Service Account
- ✅ CORS restrictions limit API access
- ❌ Don't commit `.env` file to git
- ❌ Don't share Service Account JSON key publicly

## 📊 Data Flow

```
User answers question
       ↓
Frontend calls /api/record-answer
       ↓
Backend validates and records to Sheets
       ↓
Backend returns statistics
       ↓
Frontend displays "X% answered correctly"
       ↓
User completes quiz
       ↓
Frontend calls /api/complete-session
       ↓
Backend saves final score
       ↓
Backend updates score_distribution
       ↓
Frontend fetches distribution
       ↓
Chart displays score histogram
```

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) first.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- Built for museum exhibitions
- Cosmic theme inspired by astronomy content
- Chart.js for beautiful visualizations
- Vercel for serverless hosting

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [backend/README.md](backend/README.md) for API details
3. Check [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md) for Sheets help
4. Open an issue on GitHub

---

**Made with ❤️ for astronomy enthusiasts**
