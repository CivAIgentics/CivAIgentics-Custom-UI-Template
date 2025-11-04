export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messageIndex, feedbackType, messageContent, conversationId, timestamp } = req.body;

  if (messageIndex === undefined || !feedbackType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log feedback data
  console.log('📊 Message Feedback Received:', {
    messageIndex,
    feedbackType,
    messageContent: messageContent?.substring(0, 100) + '...',
    conversationId,
    timestamp,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });

  // Send to Google Sheets
  try {
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      const sheetData = {
        timestamp: timestamp || new Date().toISOString(),
        feedbackType: feedbackType,
        messageContent: messageContent || '',
        conversationId: conversationId || 'unknown',
        messageIndex: messageIndex,
        userAgent: req.headers['user-agent'] || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
      };

      const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData)
      });

      if (response.ok) {
        console.log('✅ Feedback sent to Google Sheets');
      } else {
        console.error('❌ Failed to send to Google Sheets:', await response.text());
      }
    } else {
      console.log('⚠️ GOOGLE_SHEETS_WEBHOOK_URL not configured - feedback logged only');
    }
  } catch (error) {
    console.error('❌ Error sending to Google Sheets:', error);
    // Don't fail the request if Google Sheets fails
  }

  return res.status(200).json({ 
    success: true,
    message: 'Feedback recorded',
    data: {
      messageIndex,
      feedbackType,
      timestamp
    }
  });
}
