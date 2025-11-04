# Email Transcript Functionality

## Overview
The Jacky 2.0 widget now includes the ability to email conversation transcripts to users. When a conversation has messages, users can click the "Email Transcript" button in the footer to receive a formatted copy of their conversation via email.

## Setup Instructions

### 1. Get Resend API Key
1. Sign up for a free account at [resend.com](https://resend.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (starts with `re_`)

### 2. Configure Email Domain
1. In your Resend dashboard, go to Domains
2. Add and verify your domain: `midlandtexas.gov`
3. Follow the DNS verification steps provided by Resend
4. Wait for domain verification to complete

### 3. Set Environment Variables

#### Local Development
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Resend API key to `.env.local`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

#### Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key
   - Environment: Production (and optionally Preview)
4. Redeploy your application

### 4. Testing

#### Test Locally
1. Start the development server: `npm run dev`
2. Open the widget and have a conversation
3. Click "Email Transcript" button in the footer
4. Enter your email address
5. Click "Send Transcript"
6. Check your inbox for the formatted email

#### Test in Production
1. Deploy to Vercel with environment variable configured
2. Test the same flow on your production URL

## Features

### User Experience
- **Button Visibility**: "Email Transcript" button only appears when there are messages in the conversation
- **Email Form**: Modal popup with email input field
- **Status Feedback**: Visual feedback for sending, success, and error states
- **Auto-close**: Form automatically closes after successful send

### Email Format
- **Sender**: Jacky 2.0 <askjacky@midlandtexas.gov>
- **Subject**: "Your Conversation with Jacky 2.0 - City of Midland"
- **Content**: 
  - Professional HTML template with City of Midland branding
  - All messages with timestamps
  - Color-coded by sender (Jacky vs User)
  - City contact information in footer

### Security
- Email validation (basic regex)
- Input sanitization
- API rate limiting (provided by Resend)
- Environment variable protection

## API Endpoint

### `/pages/api/send-transcript.js`

#### Request
```json
POST /api/send-transcript
Content-Type: application/json

{
  "to": "user@example.com",
  "transcript": [
    {
      "type": "agent",
      "content": "Hello! How can I help you?",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "type": "user",
      "content": "I need help with my water bill.",
      "timestamp": "2024-01-15T10:30:15.000Z"
    }
  ],
  "conversationId": "conversation_1705315800000"
}
```

#### Response (Success)
```json
{
  "success": true,
  "messageId": "msg_abc123xyz"
}
```

#### Response (Error)
```json
{
  "error": "Invalid email address"
}
```

## Troubleshooting

### Email Not Sending
1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly in environment variables
2. **Check Domain**: Ensure `midlandtexas.gov` domain is verified in Resend dashboard
3. **Check Logs**: Look at Vercel function logs or local console for error messages
4. **Check Rate Limits**: Resend free tier has sending limits (100 emails/day)

### Email Goes to Spam
1. Complete domain verification (SPF, DKIM, DMARC records)
2. Use a verified domain (not test domain)
3. Avoid spam trigger words in email content
4. Build sender reputation gradually

### Form Not Appearing
1. Ensure there are messages in the conversation (button only shows when `messages.length > 0`)
2. Check browser console for JavaScript errors
3. Verify CSS is loading correctly

## Files Modified

### New Files
- `/pages/api/send-transcript.js` - API endpoint for sending emails
- `EMAIL_FUNCTIONALITY.md` - This documentation file

### Updated Files
- `/pages/widget.js`:
  - Added state: `showEmailForm`, `emailAddress`, `emailStatus`
  - Added handler: `handleSendTranscript`
  - Added email button and form UI in footer

- `/styles/widget.module.css`:
  - Added styles: `.emailBtn`, `.emailFormOverlay`, `.emailForm`, `.emailInput`, `.emailFormButtons`, `.cancelBtn`, `.submitBtn`, `.emailSuccess`, `.emailError`

- `/.env.local.example`:
  - Added `RESEND_API_KEY` placeholder

## Cost Considerations

### Resend Pricing (as of 2024)
- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Tier**: $20/month for 50,000 emails
- **Business Tier**: Custom pricing

For City of Midland use case with estimated traffic:
- Free tier should be sufficient for initial deployment
- Monitor usage via Resend dashboard
- Upgrade if approaching limits

## Future Enhancements

Potential improvements:
1. **Auto-email**: Automatically send transcript when conversation ends
2. **Email Templates**: Multiple template designs (light/dark theme)
3. **Selective Transcript**: Allow users to select which messages to include
4. **PDF Attachment**: Generate PDF version of transcript
5. **Email Preferences**: Remember user's email address (with consent)
6. **Admin Notifications**: CC City staff on certain types of conversations
7. **Analytics**: Track email open rates and user engagement

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review Resend dashboard for delivery status
3. Contact City of Midland AI Team
4. Check Resend documentation: https://resend.com/docs

## Security Best Practices

1. **Never commit API keys** to version control
2. Use environment variables for all sensitive data
3. Keep `.env.local` in `.gitignore`
4. Rotate API keys periodically
5. Monitor for unusual sending patterns
6. Implement rate limiting if needed
7. Validate all user inputs
