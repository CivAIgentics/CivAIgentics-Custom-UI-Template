# Google Sheets Feedback Integration Setup

## Overview
Message feedback from users automatically flows into a Google Sheet for easy tracking and analysis.

---

## Step 1: Create Your Google Sheets

### Sheet 1: Message Feedback

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: **"Jacky 2.0 - User Feedback"**

4. **Rename the first sheet to "Message Feedback"**

5. **Set up the header row** (Row 1):
   ```
   A1: Timestamp
   B1: Feedback Type
   C1: Message Content
   D1: Conversation ID
   E1: Message Index
   F1: User Agent
   G1: IP Address
   ```

### Sheet 2: Star Ratings

1. Click the **"+"** at the bottom to add a new sheet
2. Name it: **"Star Ratings"**

3. **Set up the header row** (Row 1):
   ```
   A1: Timestamp
   B1: Rating
   C1: Conversation ID
   D1: Total Messages
   E1: User Agent
   F1: IP Address
   ```

### Optional Formatting (both sheets)
- Make header rows bold
- Freeze header rows (View → Freeze → 1 row)
- Add alternating colors (Format → Alternating colors)

---

## Step 2: Create Google Apps Script Webhook

1. In your Google Sheet, click **Extensions → Apps Script**

2. **Delete** the default code

3. **Paste this updated code** (handles both feedback and ratings):

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Format timestamp
    const timestamp = new Date(data.timestamp);
    const formattedTimestamp = Utilities.formatDate(
      timestamp, 
      Session.getScriptTimeZone(), 
      'yyyy-MM-dd HH:mm:ss'
    );
    
    // Check if this is a rating or message feedback
    if (data.type === 'rating') {
      // Star Rating - write to "Star Ratings" sheet
      const ratingsSheet = spreadsheet.getSheetByName('Star Ratings');
      if (!ratingsSheet) {
        throw new Error('Star Ratings sheet not found');
      }
      
      const rowData = [
        formattedTimestamp,              // Timestamp
        data.rating,                     // Rating (1-5)
        data.conversationId,             // Conversation ID
        data.totalMessages,              // Total Messages
        data.userAgent,                  // User Agent
        data.ip                          // IP Address
      ];
      
      ratingsSheet.appendRow(rowData);
      
    } else {
      // Message Feedback - write to "Message Feedback" sheet
      const feedbackSheet = spreadsheet.getSheetByName('Message Feedback');
      if (!feedbackSheet) {
        throw new Error('Message Feedback sheet not found');
      }
      
      const rowData = [
        formattedTimestamp,              // Timestamp
        data.feedbackType,               // Feedback Type (positive/negative)
        data.messageContent,             // Message Content
        data.conversationId,             // Conversation ID
        data.messageIndex,               // Message Index
        data.userAgent,                  // User Agent
        data.ip                          // IP Address
      ];
      
      feedbackSheet.appendRow(rowData);
    }
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data recorded'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Save the script**
   - Click the disk icon or press `Ctrl+S` (Windows) or `Cmd+S` (Mac)
   - Name it: **"Feedback & Rating Webhook"**

---

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**

2. Click the gear icon ⚙️ next to "Select type"

3. Choose **"Web app"**

4. Configure deployment:
   ```
   Description: Jacky Feedback Webhook
   Execute as: Me (your email)
   Who has access: Anyone
   ```

5. Click **Deploy**

6. **Authorize the app**
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" (if warning appears)
   - Click "Go to Feedback Webhook (unsafe)"
   - Click "Allow"

7. **Copy the Web App URL**
   - It looks like: `https://script.google.com/macros/s/AKfycbz.../exec`
   - This is your **GOOGLE_SHEETS_WEBHOOK_URL**

---

## Step 4: Configure Environment Variables

### For Local Development:

1. Create or edit `.env.local` in your project root:
   ```bash
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

### For Production (Vercel):

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add new variable:
   - **Name**: `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value**: Your web app URL
   - **Environment**: Production (and optionally Preview)
5. **Redeploy** your application

---

## Step 5: Test It!

### Test Message Feedback:
1. Open your widget
2. Have a conversation with Jacky
3. Click 👍 or 👎 on one of Jacky's messages
4. Check the **"Message Feedback"** sheet - you should see a new row!

**Example row:**
```
2025-11-04 10:30:00 | positive | The City of Midland offers... | conversation_123 | 2 | Mozilla/5.0... | 192.168.1.1
```

### Test Star Rating:
1. Scroll to the bottom of the widget
2. Click on the stars (1-5) to rate your experience
3. Check the **"Star Ratings"** sheet - you should see a new row!

**Example row:**
```
2025-11-04 10:35:00 | 5 | conversation_123 | 8 | Mozilla/5.0... | 192.168.1.1
```

---

## Troubleshooting

### Feedback not appearing in sheet?

1. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click latest deployment → Functions
   - Look for `/api/feedback` errors

2. **Check Apps Script logs**:
   - In Apps Script editor: Executions (clock icon on left)
   - Look for failed executions

3. **Verify webhook URL**:
   - Make sure it ends with `/exec`
   - No extra spaces or characters

4. **Test webhook manually**:
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{
       "timestamp": "2025-11-04T10:00:00.000Z",
       "feedbackType": "positive",
       "messageContent": "Test message",
       "conversationId": "test_123",
       "messageIndex": 0,
       "userAgent": "test",
       "ip": "127.0.0.1"
     }'
   ```

### "Authorization required" error?

1. Redeploy the Apps Script web app
2. Make sure "Who has access" is set to **"Anyone"**
3. Try re-authorizing the script

### Sheet fills with test data?

- That's normal during testing!
- You can delete test rows
- Or create a new sheet and update the script

---

## Advanced: Add Charts & Analysis

### 1. Feedback Summary (Positive vs Negative)

1. In a new column (H1), add: **"Summary"**
2. Below it:
   ```
   H2: Positive Count
   I2: =COUNTIF(B:B,"positive")
   
   H3: Negative Count
   I3: =COUNTIF(B:B,"negative")
   
   H4: Total
   I4: =I2+I3
   
   H5: Positive %
   I5: =I2/I4*100
   ```

### 2. Create a Pie Chart

1. Select cells H2:I3
2. Insert → Chart
3. Chart type: Pie chart
4. Customize colors (green for positive, red for negative)

### 3. Filter by Date Range

1. Select all data (Ctrl+A)
2. Data → Create a filter
3. Click filter icon on Timestamp column
4. Choose date range

### 4. Most Common Negative Feedback

1. Create a pivot table (Insert → Pivot table)
2. Rows: Message Content
3. Values: COUNT of Message Content
4. Filter: Feedback Type = "negative"
5. Sort by count descending

---

## Sharing the Sheet

### Share with Team Members:

1. Click **Share** button (top right)
2. Add email addresses
3. Set permission: **Viewer** (read-only) or **Editor**
4. Click "Send"

### Create a Dashboard View:

1. Duplicate the sheet (right-click sheet tab → Duplicate)
2. Rename to "Dashboard"
3. Add charts and summary stats
4. Hide detailed data rows
5. Share this view with leadership

---

## Maintenance

### Keep Your Sheet Clean:

1. **Archive old data monthly**:
   - Create new sheet: "Archive - November 2025"
   - Move old rows there
   - Keeps main sheet fast

2. **Set up conditional formatting**:
   - Format → Conditional formatting
   - Format cells with "negative" feedback in red

3. **Add data validation**:
   - Ensure data quality
   - Prevent manual entry errors

---

## Benefits You Get:

✅ **Real-time feedback** - See user reactions instantly
✅ **Easy sharing** - Send link to anyone
✅ **Built-in analytics** - Charts, pivot tables, filters
✅ **Export ready** - Download as CSV/Excel for reports
✅ **No cost** - Completely free
✅ **Accessible** - Works on phone, tablet, desktop
✅ **Familiar** - Everyone knows spreadsheets
✅ **Searchable** - Find specific feedback quickly

---

## Next Steps:

1. ✅ Create your Google Sheet
2. ✅ Set up Apps Script webhook
3. ✅ Deploy and get URL
4. ✅ Add to environment variables
5. ✅ Test with real feedback
6. 📊 Share with your team!

**Questions?** Check the troubleshooting section or test the webhook manually.

---

## Security Notes:

- ✅ Webhook URL is safe to use (it's meant to be called publicly)
- ✅ No sensitive data exposed (message content only)
- ✅ Sheet access controlled by Google permissions
- ⚠️ Don't share your webhook URL publicly (prevents spam)
- ⚠️ Review sheet permissions regularly

**Your feedback data is now flowing automatically! 🎉**
