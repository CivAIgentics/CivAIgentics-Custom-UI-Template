export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, agentId } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY not found in environment');
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('Sending text message to agent:', agentId);
    
    // Call ElevenLabs text-to-text API for conversational AI
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          agent_id: agentId,
          text: message,
          mode: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to get response from Jacky',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('Successfully got response from agent');
    
    // Extract the text response from Jacky
    const agentResponse = data.text || data.response || data.message || 'I received your message.';
    
    return res.status(200).json({ 
      response: agentResponse,
      conversationId: data.conversation_id 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
