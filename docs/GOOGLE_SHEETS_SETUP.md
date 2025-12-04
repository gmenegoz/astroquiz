# Google Sheets Setup Guide

Complete guide for setting up Google Sheets as the database for AstroQuiz.

## Overview

AstroQuiz uses Google Sheets as a database because:
- ✅ Non-technical staff can view/edit data easily
- ✅ Built-in export (CSV, Excel, PDF)
- ✅ Free and reliable
- ✅ Collaborative editing
- ✅ Version history
- ✅ No database maintenance needed

## Table of Contents

1. [Create Google Cloud Project](#1-create-google-cloud-project)
2. [Enable Google Sheets API](#2-enable-google-sheets-api)
3. [Create Service Account](#3-create-service-account)
4. [Create Spreadsheet](#4-create-spreadsheet)
5. [Configure Sheet Structure](#5-configure-sheet-structure)
6. [Add Sample Data](#6-add-sample-data)
7. [Verify Setup](#7-verify-setup)

---

## 1. Create Google Cloud Project

### Step-by-Step

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create New Project:**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `AstroQuiz` (or your preferred name)
   - Organization: Leave as "No organization" (unless you have one)
   - Click "Create"

3. **Wait for project creation** (takes ~30 seconds)

4. **Select your project:**
   - Click the project dropdown again
   - Select your newly created project

### ✅ Verification

You should see your project name in the top navigation bar.

---

## 2. Enable Google Sheets API

### Step-by-Step

1. **Open API Library:**
   - In the left sidebar, click "APIs & Services" → "Library"
   - Or visit: https://console.cloud.google.com/apis/library

2. **Search for Sheets API:**
   - In the search bar, type: `Google Sheets API`
   - Click on "Google Sheets API" from results

3. **Enable the API:**
   - Click the blue "Enable" button
   - Wait for it to enable (~10 seconds)

### ✅ Verification

You should see "API enabled" with a green checkmark.

---

## 3. Create Service Account

### What is a Service Account?

A Service Account is like a "robot user" that your backend can use to access Google Sheets without human interaction. Perfect for museum kiosks!

### Step-by-Step

1. **Navigate to Service Accounts:**
   - Click "APIs & Services" → "Credentials"
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create Service Account:**
   - Click "+ Create Credentials" at the top
   - Select "Service Account"

3. **Service Account Details:**
   - **Service account name:** `astroquiz-backend`
   - **Service account ID:** (auto-filled, leave as is)
   - **Description:** `Service account for AstroQuiz backend API`
   - Click "Create and Continue"

4. **Grant Permissions (SKIP THIS):**
   - Click "Continue" (we don't need project-level permissions)

5. **Grant User Access (SKIP THIS):**
   - Click "Done"

### Create JSON Key

1. **Find your Service Account:**
   - You should see it in the Service Accounts list
   - Click on the service account name

2. **Create Key:**
   - Click on the "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Click "Create"

3. **Download JSON File:**
   - A JSON file will download automatically
   - **SAVE THIS FILE SECURELY** - it's like a password!
   - Rename it to something memorable like `astroquiz-service-account.json`

### 📝 Note the Service Account Email

1. Open the downloaded JSON file
2. Find the `client_email` field
3. It looks like: `astroquiz-backend@your-project.iam.gserviceaccount.com`
4. **Copy this email** - you'll need it in the next step!

### ✅ Verification

You should have:
- [x] Service account created
- [x] JSON key file downloaded and saved
- [x] Service account email copied

---

## 4. Create Spreadsheet

### Step-by-Step

1. **Create New Spreadsheet:**
   - Go to: https://sheets.google.com
   - Click "+ Blank" to create new spreadsheet

2. **Name the Spreadsheet:**
   - Click "Untitled spreadsheet" at the top
   - Enter name: `AstroQuiz Data`
   - Press Enter

3. **Get Spreadsheet ID:**
   - Look at the URL in your browser
   - It looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
   - **Save this ID** - you'll need it for the backend configuration!

4. **Share with Service Account:**
   - Click the "Share" button (top right)
   - Paste the service account email you copied earlier
   - Change permission to "Editor"
   - **IMPORTANT:** Uncheck "Notify people" (it's a bot, not a person!)
   - Click "Share" or "Send"

### ✅ Verification

The service account email should appear in the "People with access" list.

---

## 5. Configure Sheet Structure

You need to create 4 sheets with specific structures.

### Sheet 1: `questions`

**Purpose:** Stores quiz questions and answers

1. **Rename Sheet:**
   - Right-click on "Sheet1" tab at bottom
   - Select "Rename"
   - Enter: `questions`

2. **Add Headers (Row 1):**
   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex |

3. **Format:**
   - Select row 1 (header row)
   - Make it bold (Ctrl+B or Cmd+B)
   - Optional: Add background color for visibility

**Column Explanations:**
- `questionID`: Unique identifier (e.g., "q1", "q2", "cannocchiale")
- `question`: The question text
- `answer0`, `answer1`, `answer2`: Three answer choices
- `correctAnswerIndex`: Which answer is correct (0=answer0, 1=answer1, 2=answer2)

### Sheet 2: `sessions`

**Purpose:** Tracks each quiz attempt (completed or abandoned)

1. **Create New Sheet:**
   - Click "+" button at bottom left
   - Rename to: `sessions`

2. **Add Headers (Row 1):**
   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | sessionID | timestamp_start | timestamp_end | status | final_score | total_questions | percentage |

**Column Explanations:**
- `sessionID`: Unique session identifier (auto-generated)
- `timestamp_start`: When quiz started (ISO format)
- `timestamp_end`: When quiz completed/abandoned
- `status`: "started", "completed", or "abandoned"
- `final_score`: Number of correct answers
- `total_questions`: Total number of questions
- `percentage`: Score percentage

**Note:** This sheet starts empty. Data is added automatically by the backend.

### Sheet 3: `answer_stats`

**Purpose:** Tracks how many people selected each answer for each question

1. **Create New Sheet:**
   - Click "+" button
   - Rename to: `answer_stats`

2. **Add Headers (Row 1):**
   | A | B | C | D | E |
   |---|---|---|---|---|
   | questionID | answer0_count | answer1_count | answer2_count | total_responses |

**Column Explanations:**
- `questionID`: Matches questionID from questions sheet
- `answer0_count`: Number of people who selected answer0
- `answer1_count`: Number of people who selected answer1
- `answer2_count`: Number of people who selected answer2
- `total_responses`: Total number of responses for this question

**Note:** This sheet starts empty. Data is added automatically by the backend.

### Sheet 4: `score_distribution`

**Purpose:** Tracks the distribution of final scores (for histogram)

1. **Create New Sheet:**
   - Click "+" button
   - Rename to: `score_distribution`

2. **Add Headers (Row 1):**
   | A | B |
   |---|---|
   | score | count |

**Column Explanations:**
- `score`: Final score (0 to total_questions)
- `count`: Number of people who got this score

**Note:** This sheet starts empty. Data is added automatically by the backend.

### Sheet 5: `score_description`

**Purpose:** Stores personalized result messages based on final score

1. **Create New Sheet:**
   - Click "+" button
   - Rename to: `score_description`

2. **Add Headers (Row 1):**
   | A | B | C |
   |---|---|---|
   | score | title | description |

**Column Explanations:**
- `score`: Final score value (0 to total_questions)
- `title`: Short title for the achievement level
- `description`: Detailed description of the result

**Example Data:**
| score | title | description |
|-------|-------|-------------|
| 3 | Astro-Tourist | Every light you see, you think it is a star |
| 7 | Star Navigator | You know your way around the cosmos |
| 10 | Astro Expert | Perfect knowledge of astronomy! |

**Note:** You should add entries for all possible score values. The backend will find the exact match or closest lower score.

### ✅ Verification

You should have exactly 5 sheets:
- [x] `questions` (with headers)
- [x] `sessions` (with headers)
- [x] `answer_stats` (with headers)
- [x] `score_distribution` (with headers)
- [x] `score_description` (with headers and sample data)

**IMPORTANT:** Sheet names are case-sensitive!

---

## 6. Add Sample Data

Let's add sample questions to test the system.

### Add Questions to `questions` Sheet

**Row 2:**
| questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex |
|------------|----------|---------|---------|---------|-------------------|
| cannocchiale | Chi ha inventato il cannocchiale? | Galileo Galilei | Paolo Antoniazzi | Qualcun altro | 2 |

**Row 3:**
| questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex |
|------------|----------|---------|---------|---------|-------------------|
| congiunzione | Cosa succede durante una congiunzione planetaria? | Due pianeti si fondono | Sembrano vicini | Anima gemella | 1 |

**Row 4:**
| questionID | question | answer0 | answer1 | answer2 | correctAnswerIndex |
|------------|----------|---------|---------|---------|-------------------|
| stelle_cadenti | Quanto sono grandi i frammenti di roccia che danno origine alle stelle cadenti? | Granello di sabbia | Come un pugno | Come un'automobile | 0 |

### ✅ Verification

Your `questions` sheet should have:
- Header row + 3 question rows = 4 total rows
- All cells filled (no empty cells)
- `correctAnswerIndex` is 0, 1, or 2

---

## 7. Verify Setup

### Checklist

- [x] Google Cloud Project created
- [x] Google Sheets API enabled
- [x] Service Account created
- [x] JSON key file downloaded
- [x] Spreadsheet created and named
- [x] Spreadsheet shared with service account email
- [x] Spreadsheet ID copied
- [x] 4 sheets created with correct names
- [x] Headers added to all sheets
- [x] Sample questions added to `questions` sheet

### Test the Connection

You can test the connection before deploying the full backend:

1. **Create a test script** (`test-connection.js`):
```javascript
const { google } = require('googleapis');

const credentials = require('./astroquiz-service-account.json');
const SPREADSHEET_ID = 'your-spreadsheet-id-here';

async function testConnection() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'questions!A1:F',
    });

    console.log('✅ Connection successful!');
    console.log('Questions found:', response.data.values.length - 1);
    console.log(response.data.values);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

2. **Run it:**
```bash
npm install googleapis
node test-connection.js
```

### What to Do if Test Fails

**Error: "The caller does not have permission"**
- Make sure you shared the spreadsheet with the service account email
- Check that you gave "Editor" permissions

**Error: "Unable to parse range"**
- Check that your sheet names are exactly: `questions`, `sessions`, etc.
- Sheet names are case-sensitive!

**Error: "Requested entity was not found"**
- Double-check the Spreadsheet ID
- Make sure you copied it correctly from the URL

---

## Understanding the Data Flow

### When a user takes the quiz:

1. **Quiz starts** → New row added to `sessions` sheet
2. **User answers question** → Counters updated in `answer_stats` sheet
3. **User completes quiz** → Session marked complete in `sessions` sheet
4. **Final score recorded** → Counter updated in `score_distribution` sheet

### What staff sees:

**In `sessions` sheet:**
- Every quiz attempt (completed or abandoned)
- When it started/ended
- Final scores

**In `answer_stats` sheet:**
- How many people selected each answer
- Which questions are most difficult

**In `score_distribution` sheet:**
- How many people got 0/10, 1/10, 2/10, etc.
- Overall quiz difficulty

---

## Tips for Museum Staff

### Viewing Data

1. **Open the spreadsheet**
2. **Click on the sheet** you want to view (tabs at bottom)
3. **Use filters** (Data → Create a filter) to analyze data

### Exporting Data

1. **File → Download → CSV** (or Excel, PDF)
2. Or copy/paste into Excel for further analysis

### Editing Questions

1. **Open `questions` sheet**
2. **Edit cells directly** (like any spreadsheet)
3. **Changes take effect immediately** - no deployment needed!

### Adding New Questions

1. **Go to `questions` sheet**
2. **Add new row** with all columns filled:
   - Unique `questionID`
   - Question text
   - 3 answers
   - Correct answer index (0, 1, or 2)

### Clearing Old Data

To start fresh (e.g., after testing):

1. **Delete all rows except headers** in:
   - `sessions`
   - `answer_stats`
   - `score_distribution`

2. **Keep `questions` sheet** (unless you want to change questions)

---

## Security Notes

### ✅ Safe to Share:
- Service account email (it's just an identifier)
- Spreadsheet ID (not sensitive)

### ❌ NEVER Share:
- Service Account JSON key file (it's like a password!)
- Don't commit it to GitHub
- Don't send it via email
- Store it securely (password manager, encrypted drive)

### Access Control:
- Only share spreadsheet with service account email
- Don't make spreadsheet public
- Use "Editor" permissions (not "Owner")

---

## Troubleshooting

### "Sheet not found" errors
- Check sheet names are exactly: `questions`, `sessions`, `answer_stats`, `score_distribution`
- No extra spaces!
- Case-sensitive!

### "Permission denied" errors
- Verify spreadsheet is shared with service account email
- Check that permission is "Editor" not "Viewer"

### Data not updating
- Check that backend is deployed and running
- Verify Spreadsheet ID in backend environment variables
- Check backend logs in Vercel

### Questions not loading
- Make sure `questions` sheet has the correct headers
- Check that `correctAnswerIndex` is 0, 1, or 2 (not 1, 2, 3!)
- Verify no empty cells in question rows

---

## Next Steps

Once your Google Sheets setup is complete:

1. [x] Configure backend with Spreadsheet ID and Service Account credentials
2. [ ] Deploy backend to Vercel
3. [ ] Test the API endpoints
4. [ ] Configure frontend with backend URL
5. [ ] Deploy frontend to GitHub Pages
6. [ ] Test end-to-end flow

See [README.md](../README.md) for full deployment instructions.

---

**Need help?** Check the main [README.md](../README.md) or [backend/README.md](../backend/README.md) for more details.
