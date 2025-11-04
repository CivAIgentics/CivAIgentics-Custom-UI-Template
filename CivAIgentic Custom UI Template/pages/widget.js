import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import styles from '../styles/widget.module.css';
import dynamic from 'next/dynamic';

// Dynamically import the Orb component to avoid SSR issues with Three.js
const Orb = dynamic(
  () => import('../components/orb').then(mod => ({ default: mod.Orb })),
  { ssr: false }
);

// Dynamically import the ShimmeringText component
const ShimmeringText = dynamic(
  () => import('../components/shimmering-text').then(mod => ({ default: mod.ShimmeringText })),
  { ssr: false }
);

// Function to parse text and create hyperlinks
const parseMessageWithLinks = (text) => {
  const urlWithProtocolRegex = /(https?:\/\/[^\s]+)/g;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
  const urlWithoutProtocolRegex = /\b([a-zA-Z0-9][-a-zA-Z0-9]*\.(gov|com|org|net|edu|mil|us|ca|uk|info|io|co|ai|app|dev|tech|online|site|website|blog|shop|store|biz|me)(?:\/[^\s]*)?)\b/gi;
  
  let parts = [text];
  
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part;
    const split = part.split(urlWithProtocolRegex);
    return split.map((segment, i) => 
      urlWithProtocolRegex.test(segment) 
        ? <a key={`url-proto-${i}`} href={segment} target="_blank" rel="noopener noreferrer" className={styles.link}>{segment}</a>
        : segment
    );
  });
  
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part;
    const split = part.split(emailRegex);
    return split.map((segment, i) => 
      emailRegex.test(segment)
        ? <a key={`email-${i}`} href={`mailto:${segment}`} className={styles.link}>{segment}</a>
        : segment
    );
  });
  
  parts = parts.flatMap((part, partIdx) => {
    if (typeof part !== 'string') return part;
    
    const matches = [];
    let match;
    const regex = new RegExp(urlWithoutProtocolRegex);
    
    while ((match = regex.exec(part)) !== null) {
      matches.push({
        text: match[0],
        index: match.index
      });
    }
    
    if (matches.length === 0) return part;
    
    const result = [];
    let lastIndex = 0;
    
    matches.forEach((m, i) => {
      if (m.index > lastIndex) {
        result.push(part.substring(lastIndex, m.index));
      }
      
      result.push(
        <a key={`url-${partIdx}-${i}`} href={`https://${m.text}`} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {m.text}
        </a>
      );
      
      lastIndex = m.index + m.text.length;
    });
    
    if (lastIndex < part.length) {
      result.push(part.substring(lastIndex));
    }
    
    return result;
  });
  
  return parts;
};

const AGENT_ID = 'agent_8601k89mc91repq8xd2zg2brmkkq';

export default function WidgetPage() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isJackyMuted, setIsJackyMuted] = useState(true); // Start with Jacky muted by default
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({}); // Track feedback per message: { messageIndex: 'positive' | 'negative' }
  const [starRating, setStarRating] = useState(0); // Overall star rating (1-5)
  const [hoveredStar, setHoveredStar] = useState(0); // For hover effect
  const messagesEndRef = useRef(null);

  const conversation = useConversation({
    micMuted: isMicMuted, // Pass the muted state as a controlled prop
    volume: isJackyMuted ? 0 : 1, // Control volume - start at 0 (muted)
    onConnect: () => {
      console.log('✅ Connected to ElevenLabs agent');
      console.log('Input volume:', conversation.getInputVolume?.());
      console.log('Output volume:', conversation.getOutputVolume?.());
      setIsConnected(true);
      // Don't show connection message in chat
    },
    onDisconnect: (disconnectEvent) => {
      console.log('❌ Disconnected from agent');
      console.log('Disconnect event details:', disconnectEvent);
      setIsConnected(false);
      
      // Handle abnormal disconnects (code 1006)
      if (disconnectEvent?.code === 1006) {
        console.error('Abnormal disconnect (1006) - possible causes: API key issue, network problem, or agent configuration');
        addMessage('error', 'Connection failed. Please check your internet connection and try again.');
      }
    },
    onMessage: (message) => {
      console.log('📨 Message received:', message);
      if (message.message) {
        const isUserMessage = message.source === 'user' || message.role === 'user';
        console.log(`Message type: ${isUserMessage ? 'USER' : 'AGENT'}, Content:`, message.message);
        addMessage(isUserMessage ? 'user' : 'agent', message.message);
      }
      console.log('Full message object:', JSON.stringify(message));
    },
    onAudio: (audio) => {
      console.log('🔊 Audio received:', audio);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      addMessage('error', `Error: ${error.message}`);
    },
    onModeChange: (mode) => {
      console.log('🔄 Mode changed to:', mode);
      // Don't show mode changes in the chat
    },
    onStatusChange: (status) => {
      console.log('📊 Status changed:', status);
    },
  });

  const addMessage = useCallback((type, content) => {
    setMessages(prev => [...prev, { type, content, timestamp: Date.now() }]);
  }, []);

  const handleConnect = async () => {
    if (isConnected) return;
    
    try {
      addMessage('system', 'Connecting to Jacky with voice...');
      
      // Get signed URL from our API endpoint
      console.log('Fetching signed URL...');
      const signedUrlResponse = await fetch('/api/get-signed-url');
      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get signed URL from server');
      }
      const { signedUrl } = await signedUrlResponse.json();
      console.log('Got signed URL, starting voice session...');
      
      const conversationId = await conversation.startSession({
        signedUrl: signedUrl,
      });
      console.log('Connected with conversation ID:', conversationId);
      
      // Wait a moment for connection to fully establish
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Voice mode - microphone active AND Jacky's audio UNMUTED (full volume)
      setIsMicMuted(false); // Unmute microphone via controlled prop
      setIsJackyMuted(false); // Unmute Jacky's audio for voice calls
      console.log('Voice mode: microphone unmuted, Jacky audio UNMUTED (volume=100%)');
      
      addMessage('system', 'Voice chat connected. You can speak and hear Jacky.');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        addMessage('error', 'Microphone permission denied. To use voice chat, please allow microphone access. You can still use text chat by typing a message.');
      } else {
        addMessage('error', `Failed to connect: ${error.message}`);
      }
    }
  };

  const handleCopyMessage = async (content, idx) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(idx);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDisconnect = () => {
    if (conversation.status === 'connected') {
      conversation.endSession();
    }
    
    setIsConnected(false);
    setIsMicMuted(false);
    setIsJackyMuted(true); // Reset to muted by default
    addMessage('system', 'Conversation ended');
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const messageToSend = textInput.trim();
    setTextInput('');
    
    if (!isConnected) {
      try {
        addMessage('system', 'Connecting to Jacky...');
        
        // Note: ElevenLabs Conversational AI requires microphone access even for text mode
        // We need to request it but will keep it muted
        addMessage('system', 'Please allow microphone access (it will be muted for text mode)');
        
        // Get signed URL from our API endpoint
        const signedUrlResponse = await fetch('/api/get-signed-url');
        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get signed URL from server');
        }
        const { signedUrl } = await signedUrlResponse.json();
        
        // Start session - this will trigger microphone permission request
        const conversationId = await conversation.startSession({
          signedUrl: signedUrl,
        });
        console.log('Connected with conversation ID (text mode):', conversationId);
        
        // Wait a moment for connection to fully establish
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Immediately mute microphone and audio for text-only mode (controlled by props)
        setIsMicMuted(true); // Mute microphone via controlled prop
        // isJackyMuted is already true by default, volume prop keeps it at 0
        console.log('Text mode: microphone and audio both muted (micMuted=true, volume=0)');
        
        addMessage('system', 'Connected! Microphone and audio are muted. Type to chat.');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        addMessage('user', messageToSend);
        console.log('Sending message:', messageToSend);
        conversation.sendUserMessage(messageToSend);
      } catch (error) {
        console.error('Failed to connect:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          addMessage('error', 'Microphone access is required to use Jacky (even for text chat). Please click Allow when prompted, or click the phone icon to try again.');
        } else {
          addMessage('error', `Failed to connect: ${error.message}`);
        }
        return;
      }
    } else {
      addMessage('user', messageToSend);
      
      try {
        console.log('Sending message to agent:', messageToSend);
        conversation.sendUserMessage(messageToSend);
        console.log('Message sent successfully');
      } catch (error) {
        console.error('Failed to send text message:', error);
        addMessage('error', `Failed to send message: ${error.message}`);
      }
    }
  };

  const handleToggleMicMute = () => {
    if (isMicMuted) {
      // Unmute microphone
      setIsMicMuted(false);
      console.log('Microphone unmuted by setting micMuted state to false');
      addMessage('system', 'Microphone unmuted - you can now speak');
    } else {
      // Mute microphone
      setIsMicMuted(true);
      console.log('Microphone muted by setting micMuted state to true');
      addMessage('system', 'Microphone muted');
    }
  };

  const handleToggleJackyMute = () => {
    if (isJackyMuted) {
      // Unmute Jacky's audio output
      setIsJackyMuted(false);
      console.log('Jacky audio unmuted by setting volume state to 1');
      addMessage('system', 'Jacky unmuted - you can now hear responses');
    } else {
      // Mute Jacky's audio output
      setIsJackyMuted(true);
      console.log('Jacky audio muted by setting volume state to 0');
      addMessage('system', 'Jacky muted');
    }
  };

  console.log('Widget render - isExpanded:', isExpanded);

  // Notify parent window of widget state changes
  const notifyParent = useCallback((type) => {
    if (window.parent !== window) {
      // Send message to parent iframe
      // Using '*' for origin since the parent domain may vary
      window.parent.postMessage({ type }, '*');
      console.log('Sent message to parent:', type);
    }
  }, []);

  // Notify parent when expansion state changes
  useEffect(() => {
    if (isExpanded) {
      notifyParent('widgetExpanded');
    } else {
      // Only notify collapse if we've been expanded before
      notifyParent('widgetCollapsed');
    }
  }, [isExpanded, notifyParent]);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleExpand = useCallback(() => {
    console.log('Button clicked, expanding widget');
    setIsExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    console.log('Closing widget');
    setIsExpanded(false);
  }, []);

  const handleMessageFeedback = useCallback(async (messageIndex, feedbackType) => {
    // Update local state immediately for instant UI feedback
    setMessageFeedback(prev => ({
      ...prev,
      [messageIndex]: feedbackType
    }));

    // Get the message content
    const message = messages[messageIndex];
    
    // Send to analytics endpoint
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIndex,
          feedbackType,
          messageContent: message?.content,
          conversationId: `conversation_${Date.now()}`,
          timestamp: new Date().toISOString()
        }),
      });
      
      console.log('✅ Feedback submitted:', { messageIndex, feedbackType });
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      // Still keep the UI feedback even if API fails
    }
  }, [messages]);

  const handleStarRating = useCallback(async (rating) => {
    // Update local state immediately
    setStarRating(rating);

    // Send to analytics endpoint
    try {
      await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          conversationId: `conversation_${Date.now()}`,
          timestamp: new Date().toISOString(),
          totalMessages: messages.length
        }),
      });
      
      console.log('✅ Star rating submitted:', rating);
    } catch (error) {
      console.error('❌ Failed to submit star rating:', error);
      // Still keep the UI feedback even if API fails
    }
  }, [messages.length]);

  return (
    <div className={styles.pageContainer}>
      {/* Collapsed Widget Button */}
      {!isExpanded && (
        <button 
          className={styles.widgetButton}
          onClick={handleExpand}
          aria-label="Open Jacky 2.0 Chat"
        >
          <div className={styles.widgetTop}>
            <div className={styles.widgetAvatar}>
              <Orb
                colors={["#1a3a52", "#3d6b8f"]}
                agentState={isConnected ? (conversation.status === "speaking" ? "talking" : "listening") : null}
                getInputVolume={() => conversation.getInputVolume?.() ?? 0}
                getOutputVolume={() => conversation.getOutputVolume?.() ?? 0}
                className={styles.orbCanvas}
              />
            </div>
            <span className={styles.widgetGreeting}>Hi, I'm Jacky 2.0 - Test 👋!</span>
          </div>
          <div className={styles.widgetCta}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.487 17.14l-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a.997.997 0 0 0-.085-1.39z"/>
            </svg>
            <span>How can I help you?</span>
          </div>
        </button>
      )}

      {/* Expanded Widget Window */}
      {isExpanded && (
        <div className={styles.widgetWindow}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetHeaderContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`${styles.orbContainer} ${isConnected && conversation.status === "speaking" ? styles.pulse : ''}`}>
                  <Orb
                    colors={["#1a3a52", "#3d6b8f"]}
                    agentState={isConnected ? (conversation.status === "speaking" ? "talking" : "listening") : null}
                    getInputVolume={() => conversation.getInputVolume?.() ?? 0}
                    getOutputVolume={() => conversation.getOutputVolume?.() ?? 0}
                    className={styles.orbCanvas}
                  />
                </div>
                <div className={styles.widgetTitleSection}>
                  <h1>
                    <ShimmeringText 
                      text="Jacky 2.0 - Test" 
                      duration={1}
                      color="#000000"
                      shimmerColor="#ffffff"
                      spread={25}
                      repeatDelay={0.1}
                    />
                  </h1>
                  <p className={styles.widgetSubtitle}>
                    <ShimmeringText 
                      text="City of Midland, Texas" 
                      duration={1}
                      delay={0.15}
                      color="#000000"
                      shimmerColor="#ffffff"
                      spread={20}
                      repeatDelay={0.1}
                    />
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={styles.statusSection}>
                  <span className={`${styles.statusIndicator} ${isConnected ? styles.online : styles.offline}`}></span>
                  <span className={styles.statusText}>
                    {isConnected ? 'On Call' : 'Not on Call'}
                  </span>
                </div>
                <button 
                  className={styles.widgetCloseBtn}
                  onClick={handleCollapse}
                  aria-label="Close chat"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.widgetContent}>
            <div className={styles.messagesContainer}>
              <div className={styles.messages}>
                {/* Welcome State - Always Visible */}
                <div className={styles.welcomeState}>
                  <h2>Welcome to Jacky 2.0 - Test</h2>
                  <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                    😀 Hi! I'm Jacky! I can help guide you to more information about the City of Midland. Let's Get Started!
                  </p>
                  <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                    ⭐Hola! ¡Soy Jacky! Puedo ayudarle a obtener más información sobre la ciudad de Midland. ¡Empecemos!
                  </p>
                  
                  {/* Quick Action Buttons */}
                  <div className={styles.quickActions}>
                    <a href="https://water.midlandtexas.gov/app/login.jsp" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                      </svg>
                      Pay my Water Bill
                    </a>
                    <a href="https://seeclickfix.com/web_portal/4vRjnxZoH4QWRjsTQ2MY4B4V/report/category" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                      </svg>
                      Report an Issue
                    </a>
                    <a href="https://www.midlandtexas.gov/1424/PermitMidland" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      Permit Midland
                    </a>
                    <a href="https://experience.arcgis.com/experience/4cc2fed9276343f39056238d9936e4c6/" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Traffic Alerts
                    </a>
                  </div>
                  
                  {messages.length === 0 && (
                    <>
                      <p>Type a message to start chatting. You'll be asked to allow microphone access (both you and Jacky will be muted for text mode).</p>
                      <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>Or click the phone icon for voice chat</p>
                    </>
                  )}
                </div>

                {/* Conversation Messages */}
                {messages.length > 0 && (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`${styles.messageWrapper} ${styles[msg.type + 'Wrapper']}`}>
                      {(msg.type === 'agent' || msg.type === 'user') && (
                        <div className={`${styles.messageOrbContainer} ${msg.type === 'agent' && idx === messages.length - 1 && conversation.status === "speaking" ? styles.pulse : ''}`}>
                          <div style={{ width: '28px', height: '28px' }}>
                            {Orb && (
                              <Orb 
                                colors={msg.type === 'agent' ? ["#1a3a52", "#3d6b8f"] : ["#78b9e8", "#CAE7FF"]}
                                agentState={msg.type === 'agent' ? 'speaking' : 'listening'}
                              />
                            )}
                          </div>
                        </div>
                      )}
                      <div className={`${styles.message} ${styles[msg.type]}`}>
                        {(msg.type === 'agent' || msg.type === 'user') && (
                          <button
                            className={`${styles.copyBtn} ${copiedMessageIndex === idx ? styles.copied : ''}`}
                            onClick={() => handleCopyMessage(msg.content, idx)}
                            title="Copy message"
                          >
                            {copiedMessageIndex === idx ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                Copied
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        )}
                        <span className={styles.messageType}>
                          {msg.type === 'agent' ? 'Jacky 2.0' : 
                           msg.type === 'user' ? 'User' :
                           msg.type === 'error' ? 'Error' : 'System'}
                        </span>
                        <span className={styles.messageContent}>
                          {parseMessageWithLinks(msg.content)}
                        </span>
                        <div className={styles.messageFooter}>
                          <span className={styles.timestamp}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                          
                          {/* Feedback buttons for agent messages only */}
                          {msg.type === 'agent' && (
                            <div className={styles.feedbackButtons}>
                              <button
                                className={`${styles.feedbackBtn} ${messageFeedback[idx] === 'positive' ? styles.feedbackActive : ''}`}
                                onClick={() => handleMessageFeedback(idx, messageFeedback[idx] === 'positive' ? null : 'positive')}
                                title="Helpful"
                                aria-label="Mark as helpful"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                                </svg>
                              </button>
                              <button
                                className={`${styles.feedbackBtn} ${messageFeedback[idx] === 'negative' ? styles.feedbackActive : ''}`}
                                onClick={() => handleMessageFeedback(idx, messageFeedback[idx] === 'negative' ? null : 'negative')}
                                title="Not helpful"
                                aria-label="Mark as not helpful"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className={styles.inputArea}>
              <form onSubmit={handleSendText} className={styles.inputForm}>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isConnected ? "Type your message or speak..." : "Type a message to start..."}
                  className={styles.messageInput}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className={styles.sendBtn}
                  disabled={!textInput.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                  </svg>
                </button>
                
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleMicMute}
                      className={`${styles.micBtn} ${isMicMuted ? styles.muted : ''}`}
                      title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isMicMuted ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21h2v-3.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleJackyMute}
                      className={`${styles.speakerBtn} ${isJackyMuted ? styles.muted : ''}`}
                      title={isJackyMuted ? "Unmute Jacky's Audio" : "Mute Jacky's Audio"}
                    >
                      {isJackyMuted ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className={styles.disconnectBtn}
                      title="End Call"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnect}
                    className={styles.connectBtn}
                    title="Start Voice Call"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.487 17.14l-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a.997.997 0 0 0-.085-1.39z"/>
                    </svg>
                  </button>
                )}
              </form>
            </div>

            <div className={styles.widgetFooter}>
              <div className={styles.widgetFooterContent}>
                <span className={styles.poweredBy}>Powered by City of Midland AI Team</span>
                
                <div className={styles.footerActions}>
                  <div className={styles.starRating}>
                    <span className={styles.ratingLabel}>Rate your experience:</span>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`${styles.starBtn} ${star <= (hoveredStar || starRating) ? styles.starActive : ''}`}
                          onClick={() => handleStarRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          aria-label={`Rate ${star} stars`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <a 
                    href="https://cityofmidlandtx.gov1.qualtrics.com/jfe/form/SV_0OPsa3AFYQafkSa" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.surveyLink}
                  >
                    Share Feedback
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
