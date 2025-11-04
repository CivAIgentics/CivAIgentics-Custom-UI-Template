# Message Feedback Feature 👍👎

## Overview
Users can now provide feedback on Jacky's responses with thumbs up/down buttons. This helps track response quality and identify areas for improvement.

## What Was Added

### UI Components
- **Feedback Buttons**: 👍 (helpful) and 👎 (not helpful) appear on hover for each agent message
- **Active State**: Buttons stay highlighted when clicked
- **Toggle Behavior**: Click again to remove feedback
- **Positioned**: In message footer next to timestamp

### Functionality
- **Instant Feedback**: UI updates immediately when clicked
- **API Logging**: Sends feedback data to `/api/feedback` endpoint
- **Persistent State**: Feedback state maintained during session
- **Agent Messages Only**: Only Jacky's messages have feedback buttons

### API Endpoint
- **Route**: `/api/feedback`
- **Method**: POST
- **Logs**: Console logs all feedback events
- **Extensible**: Ready for database integration

## How It Works

1. User reads Jacky's response
2. Hovers over message → feedback buttons appear
3. Clicks 👍 or 👎
4. Button highlights (blue background)
5. Feedback sent to API endpoint
6. Logged to console (ready for analytics)

## Files Modified

### `/pages/widget.js`
- Added `messageFeedback` state object
- Added `handleMessageFeedback` function
- Added feedback buttons in message footer JSX
- Sends feedback to `/api/feedback` endpoint

### `/styles/widget.module.css`
- `.messageFooter` - Container for timestamp and feedback buttons
- `.feedbackButtons` - Hidden by default, visible on hover
- `.feedbackBtn` - Individual button styling
- `.feedbackActive` - Highlighted state when clicked

### `/pages/api/feedback.js` (NEW)
- Receives feedback data
- Logs to console
- Returns success response
- Ready for database/analytics integration

## Data Collected

```json
{
  "messageIndex": 2,
  "feedbackType": "positive",
  "messageContent": "The City of Midland offers...",
  "conversationId": "conversation_1730764800000",
  "timestamp": "2025-11-04T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## Visual Behavior

### Default State
- Buttons hidden
- Message looks normal

### On Hover
- Buttons fade in
- Slightly transparent

### After Click
- Clicked button turns blue (#00599c)
- Stays visible even without hover
- Other button stays inactive

### Toggle
- Click same button again → deactivates
- Click other button → switches feedback

## Next Steps (Optional Enhancements)

### 1. Database Integration
```javascript
// In /api/feedback.js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('jacky');
await db.collection('feedback').insertOne({
  messageIndex,
  feedbackType,
  messageContent,
  timestamp: new Date()
});
```

### 2. Analytics Dashboard
- Track positive/negative ratio
- Identify problematic response patterns
- Monitor improvement over time

### 3. Feedback Comments
- Add optional text input: "Tell us more..."
- Appears after clicking thumbs down
- Provides qualitative insights

### 4. Thank You Message
- Show brief toast: "Thanks for your feedback!"
- Disappears after 2 seconds
- Confirms action completed

### 5. Email Alerts
- Send notification when negative feedback received
- Include message content
- Alert AI team for review

## Testing

### Manual Test
1. Start dev server: `npm run dev`
2. Open widget, have conversation
3. Hover over Jacky's message
4. Click 👍 or 👎
5. Check console for feedback log
6. Try clicking again (should toggle off)
7. Try other button (should switch)

### Check API
```bash
# Start dev server
npm run dev

# In another terminal, test API
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "messageIndex": 0,
    "feedbackType": "positive",
    "messageContent": "Hello!",
    "timestamp": "2025-11-04T10:00:00.000Z"
  }'
```

## Console Output Example

```
✅ Feedback submitted: { messageIndex: 2, feedbackType: 'positive' }

📊 Message Feedback Received: {
  messageIndex: 2,
  feedbackType: 'positive',
  messageContent: 'The City of Midland offers many services including water billing, permits...',
  conversationId: 'conversation_1730764800000',
  timestamp: '2025-11-04T10:30:00.000Z',
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1'
}
```

## Benefits

### For Users
- ✅ Quick, easy way to provide feedback
- ✅ Feels heard and valued
- ✅ No forms or extra steps

### For City of Midland
- ✅ Identify high/low quality responses
- ✅ Improve Jacky's training data
- ✅ Track satisfaction metrics
- ✅ Prioritize improvements

### For Developers
- ✅ Quantitative quality metrics
- ✅ A/B testing capabilities
- ✅ Bug/issue identification
- ✅ Performance benchmarking

## Best Practices

1. **Privacy**: Don't store PII without consent
2. **Rate Limiting**: Prevent spam/abuse
3. **Analytics**: Aggregate data for insights
4. **Action**: Review negative feedback regularly
5. **Improvement**: Use data to enhance responses

---

**Status**: ✅ Live and ready to collect feedback!
