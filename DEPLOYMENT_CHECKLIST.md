# 🚀 Deployment Checklist for AstroQuiz

Quick reference guide to deploy AstroQuiz from scratch to production.

## ⏱️ Estimated Time: 30 minutes

---

## Phase 1: Google Cloud Setup (10 min)

### □ Create Google Cloud Project
- [ ] Go to https://console.cloud.google.com/
- [ ] Create new project: "AstroQuiz"
- [ ] Note project ID: `astroquiz-479816`

### □ Enable API
- [ ] Enable Google Sheets API
- [ ] Verify API is enabled

### □ Create Service Account
- [ ] Name: `astroquiz-backend`
- [ ] Create JSON key
- [ ] Download and save key file
- [ ] Copy service account email: `__________________@____.iam.gserviceaccount.com`

---

## Phase 2: Google Sheets Setup (10 min)

### □ Create Spreadsheet
- [ ] Create new Google Sheet: "AstroQuiz Data"
- [ ] Copy Spreadsheet ID from URL: `__________________`
- [ ] Share with service account email (Editor permission)

### □ Create 4 Sheets
- [ ] Sheet 1: `questions` (with headers)
- [ ] Sheet 2: `sessions` (with headers)
- [ ] Sheet 3: `answer_stats` (with headers)
- [ ] Sheet 4: `score_distribution` (with headers)

### □ Add Sample Questions
- [ ] Add at least 3 test questions to `questions` sheet
- [ ] Verify `correctAnswerIndex` is 0, 1, or 2

---

## Phase 3: Backend Deployment (5 min)

### □ Prepare Backend
```bash
cd backend
npm install
```

### □ Deploy to Vercel
```bash
vercel login
vercel
```
- [ ] Note deployment URL: `https://____________________`

### □ Add Environment Variables in Vercel
- [ ] Go to project settings in Vercel dashboard
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_JSON` (paste entire JSON)
- [ ] Add `GOOGLE_SPREADSHEET_ID` (from Phase 2)

### □ Deploy to Production
```bash
vercel --prod
```
- [ ] Production URL: `https://____________________`

### □ Test Backend
```bash
curl https://your-vercel-url.vercel.app/api/get-questions
```
- [ ] Verify questions are returned

---

## Phase 4: Frontend Deployment (5 min)

### □ Configure Frontend
Edit `js/api-config.js`:
```javascript
BASE_URL: 'https://your-vercel-url.vercel.app'  // ← Your production URL
```

### □ Commit Changes
```bash
git add js/api-config.js
git commit -m "Configure production API URL"
git push origin main
```

### □ Deploy to GitHub Pages
- [ ] Go to repository settings on GitHub
- [ ] Pages → Source: main branch
- [ ] Wait for deployment (~2 min)
- [ ] Frontend URL: `https://____________________.github.io/astroquiz`

### □ Test Frontend
- [ ] Open frontend URL
- [ ] Click "Inizia il Quiz"
- [ ] Answer a question
- [ ] Verify statistics show up
- [ ] Complete quiz
- [ ] Check score distribution chart appears

---

## Phase 5: Verify End-to-End (2 min)

### □ Test Complete Flow
- [ ] Open quiz in browser
- [ ] Start quiz (check `sessions` sheet for new row)
- [ ] Answer all questions (check `answer_stats` sheet updates)
- [ ] Complete quiz (check `score_distribution` sheet updates)
- [ ] Verify final score is saved in `sessions` sheet

### □ Test Abandoned Session
- [ ] Start new quiz
- [ ] Answer 1-2 questions
- [ ] Refresh page (abandon quiz)
- [ ] Check `sessions` sheet shows "abandoned" status

---

## Phase 6: Optional Configuration

### □ Remove Test Button
Edit `index.html` and remove:
```html
<button id="sheets-test-btn" ...>Test Google Sheets API</button>
```

### □ Update Quiz Questions
- [ ] Replace sample questions in Google Sheets
- [ ] Test that new questions load correctly

### □ Customize Timers (if needed)
Edit `js/ui.js`:
```javascript
this.AUTO_RESET_TIMEOUT = 30;  // seconds
this.AUTO_ADVANCE_TIMEOUT = 10; // seconds
```

### □ Add Custom Domain (GitHub Pages)
- [ ] Add CNAME record in DNS
- [ ] Add custom domain in GitHub Pages settings

---

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| "Failed to load questions" | Check `BASE_URL` in `js/api-config.js` |
| "Permission denied" | Verify sheet shared with service account email |
| "Sheet not found" | Check sheet names: `questions`, `sessions`, etc. |
| CORS errors | Add frontend domain to `ALLOWED_ORIGINS` in Vercel |
| No statistics showing | Need multiple quiz attempts for stats |
| Chart not displaying | Check browser console for Chart.js errors |

---

## Post-Deployment

### □ Documentation for Museum Staff
- [ ] Share Google Sheets URL
- [ ] Explain how to view data
- [ ] Show how to export CSV
- [ ] Demonstrate editing questions

### □ Monitor First Week
- [ ] Check for errors in Vercel logs
- [ ] Verify data is being recorded
- [ ] Test on actual museum kiosk hardware
- [ ] Adjust timers if needed

### □ Backup Strategy
- [ ] Schedule weekly exports of Google Sheets
- [ ] Store Service Account key in secure location
- [ ] Document Vercel and GitHub credentials

---

## Environment Variables Reference

### Vercel (Backend)
```
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_QUESTIONS=questions
SHEET_SESSIONS=sessions
SHEET_ANSWER_STATS=answer_stats
SHEET_SCORE_DISTRIBUTION=score_distribution
```

### Frontend (api-config.js)
```javascript
BASE_URL: 'https://your-vercel-deployment.vercel.app'
```

---

## URLs to Save

| Service | URL | Credentials |
|---------|-----|-------------|
| Google Cloud Console | https://console.cloud.google.com/ | Your Google account |
| Google Spreadsheet | https://docs.google.com/spreadsheets/d/YOUR_ID | Shared with service account |
| Vercel Dashboard | https://vercel.com/ | Your Vercel account |
| GitHub Repository | https://github.com/YOUR_USER/astroquiz | Your GitHub account |
| Production Frontend | https://YOUR_USER.github.io/astroquiz | - |
| Production Backend | https://YOUR_PROJECT.vercel.app | - |

---

## Maintenance Checklist (Monthly)

- [ ] Export Google Sheets data for backup
- [ ] Review abandoned session rate
- [ ] Check average scores
- [ ] Update questions if needed
- [ ] Verify Vercel deployment is healthy
- [ ] Check for any error logs

---

## Need Help?

1. Check [README.md](README.md) for detailed instructions
2. Review [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md) for Sheets issues
3. Check [backend/README.md](backend/README.md) for API documentation
4. Look at browser console for frontend errors
5. Check Vercel logs for backend errors

---

**✅ Deployment Complete!** Your AstroQuiz is now live and ready for museum visitors!
