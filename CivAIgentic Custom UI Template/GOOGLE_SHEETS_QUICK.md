# Google Sheets Setup - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Create Google Sheet
- Go to sheets.google.com
- Create new blank sheet
- Name it: "Jacky 2.0 - Message Feedback"
- Add headers in Row 1:
  ```
  Timestamp | Feedback Type | Message Content | Conversation ID | Message Index | User Agent | IP Address
  ```

### 2. Create Apps Script
- Extensions → Apps Script
- Paste the code from GOOGLE_SHEETS_SETUP.md (Step 2)
- Save

### 3. Deploy Web App
- Deploy → New deployment
- Type: Web app
- Execute as: Me
- Access: Anyone
- Copy the URL (ends with /exec)

### 4. Add to Environment
**Local (.env.local):**
```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

**Vercel:**
- Settings → Environment Variables
- Add: GOOGLE_SHEETS_WEBHOOK_URL
- Redeploy

### 5. Test
- Give thumbs up/down on Jacky message
- Check your sheet - new row appears!

---

## 📊 What You'll See

Every feedback creates a row:
```
2025-11-04 10:30:00 | positive | The City of Midland... | conversation_123 | 2 | Mozilla/5.0... | 192.168.1.1
```

---

## 🎯 Quick Analysis

**Count positives:**
```
=COUNTIF(B:B,"positive")
```

**Count negatives:**
```
=COUNTIF(B:B,"negative")
```

**Success rate:**
```
=COUNTIF(B:B,"positive")/COUNTA(B:B)*100
```

---

## 🔧 Troubleshooting

**Not working?**
1. Check webhook URL ends with `/exec`
2. Check Apps Script "Who has access" = Anyone
3. Check Vercel logs for errors
4. Test webhook with curl (see full guide)

---

## 📁 Files

- **GOOGLE_SHEETS_SETUP.md** - Complete step-by-step guide
- **pages/api/feedback.js** - Updated API endpoint
- **.env.local.example** - Shows required variable

---

**Need help?** See the full guide: GOOGLE_SHEETS_SETUP.md
