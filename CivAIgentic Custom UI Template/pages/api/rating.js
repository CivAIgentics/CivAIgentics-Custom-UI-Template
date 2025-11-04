export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rating, conversationId, timestamp, totalMessages } = req.body;

    // Validate required fields
    if (!rating) {
      return res.status(400).json({ error: 'Rating is required' });
    }

    // Get user agent and IP
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    // Log to console
    console.log('⭐ Star Rating Received:', {
      rating,
      conversationId,
      timestamp,
      totalMessages,
      userAgent,
      ip
    });

    // Send to Google Sheets if webhook URL is configured
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'rating',
            rating,
            conversationId,
            timestamp,
            totalMessages,
            userAgent,
            ip
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Google Sheets webhook error:', errorText);
        } else {
          console.log('✅ Rating sent to Google Sheets successfully');
        }
      } catch (webhookError) {
        console.error('Failed to send to Google Sheets:', webhookError);
        // Don't fail the request if Google Sheets fails
      }
    }

    return res.status(200).json({ 
      success: true,
      rating,
      conversationId,
      timestamp
    });

  } catch (error) {
    console.error('Rating API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
