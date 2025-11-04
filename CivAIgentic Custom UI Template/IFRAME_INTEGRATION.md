# 🎯 Jacky 2.0 Widget - Iframe Integration Guide

## Quick Setup

Add this code to any webpage where you want the Jacky 2.0 widget to appear:

```html
<!-- Jacky 2.0 Widget Container -->
<div id="jacky-widget-container" style="position: fixed; bottom: 70px; left: -20px; z-index: 9999;">
  <iframe 
    id="jacky-widget" 
    src="https://elevenlabs-nextjs-ip9mgh85x-steven-sierra-alcabes-projects.vercel.app/widget" 
    style="width: 290px; height: 130px; border: none; background: transparent; transition: all 0.3s ease;" 
    allow="microphone; autoplay" 
    title="Jacky 2.0 - City of Midland AI Assistant" 
    scrolling="no">
  </iframe>
</div>

<script>
  window.addEventListener('message', function(event) {
    // Security: Only accept messages from the widget origin
    if (event.origin === 'https://elevenlabs-nextjs-ip9mgh85x-steven-sierra-alcabes-projects.vercel.app') {
      var iframe = document.getElementById('jacky-widget');
      
      if (event.data.type === 'widgetExpanded') {
        // Expand iframe to show full widget
        iframe.style.width = '460px';
        iframe.style.height = '650px';
        console.log('Widget expanded');
      } else if (event.data.type === 'widgetCollapsed') {
        // Collapse iframe back to button size
        iframe.style.width = '290px';
        iframe.style.height = '130px';
        console.log('Widget collapsed');
      }
    }
  });
</script>
```

---

## Configuration Options

### Widget Position

Adjust the `position` style in the container `div`:

```html
<!-- Bottom left (default) -->
<div id="jacky-widget-container" style="position: fixed; bottom: 70px; left: -20px; z-index: 9999;">

<!-- Bottom right -->
<div id="jacky-widget-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">

<!-- Top right -->
<div id="jacky-widget-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">

<!-- Top left -->
<div id="jacky-widget-container" style="position: fixed; top: 20px; left: 20px; z-index: 9999;">
```

### Z-Index

The widget uses `z-index: 9999` to stay on top. If you have other elements with high z-index values, you may need to adjust this:

```html
<div id="jacky-widget-container" style="position: fixed; bottom: 70px; left: -20px; z-index: 10000;">
```

### Iframe Permissions

The widget requires these permissions:
- `microphone` - For voice conversations with Jacky
- `autoplay` - For audio playback of Jacky's responses

```html
allow="microphone; autoplay"
```

---

## Widget Dimensions

### Collapsed State (Button Only)
- **Width:** 290px
- **Height:** 130px
- Shows the "How can I help you?" button with animated orb

### Expanded State (Full Chat)
- **Width:** 460px
- **Height:** 650px
- Full conversational interface with message history

### Transition
- **Duration:** 0.3s
- **Easing:** ease (smooth animation)

---

## Features

✅ **Voice & Text Communication**
- Click to expand and talk to Jacky
- Type or speak your questions
- Real-time voice responses

✅ **3D Animated Orb**
- Pulsing animation when Jacky is speaking
- Color-coded (blue for Jacky, light blue for user)

✅ **Drag-to-Reposition**
- Drag the widget anywhere on screen
- Position persists across page refreshes

✅ **Smart Expansion**
- Opens upward when in lower half of screen
- Opens downward when in upper half
- Always visible and accessible

✅ **Message Management**
- Copy any message with one click
- Clear message history
- Scrollable chat window

✅ **Status Indicators**
- Green dot: "On Call" (active conversation)
- Red dot: "Not on Call" (ready to start)

---

## Testing

1. **Load the page** with the iframe code
2. **Check console** for "Widget expanded/collapsed" messages
3. **Click the widget button** - should expand to 460x650
4. **Click the × button** - should collapse back to 290x130
5. **Drag the widget** - position should persist on refresh
6. **Test microphone** - grant permission when prompted
7. **Talk to Jacky** - orb should pulse during conversation

---

## Troubleshooting

### Widget Not Loading
- Check console for errors
- Verify iframe `src` URL is correct
- Ensure network can reach Vercel domain

### Microphone Not Working
- Check browser permissions for microphone
- Verify `allow="microphone"` is in iframe tag
- Try HTTPS (required for microphone access)

### Size Not Changing
- Check console for postMessage events
- Verify event.origin matches widget URL exactly
- Ensure JavaScript is running after DOM loads

### Widget Behind Other Elements
- Increase z-index value
- Check parent container z-index
- Verify no fixed position conflicts

---

## Custom Domain Setup

To use your own domain instead of the Vercel URL:

1. Configure custom domain in Vercel dashboard
2. Update iframe `src` attribute to your domain
3. Update `event.origin` check in JavaScript

```html
<!-- Example with custom domain -->
<iframe 
  src="https://jacky.cityofmidland.gov/widget"
  ...
</iframe>

<script>
  window.addEventListener('message', function(event) {
    if (event.origin === 'https://jacky.cityofmidland.gov') {
      // Handle messages
    }
  });
</script>
```

---

## Security Notes

⚠️ **Origin Validation**
The script validates `event.origin` to ensure messages only come from the trusted widget domain. Do not remove this check.

⚠️ **Content Security Policy**
If your site uses CSP, add these directives:
```
frame-src https://elevenlabs-nextjs-ip9mgh85x-steven-sierra-alcabes-projects.vercel.app;
script-src 'unsafe-inline';
```

⚠️ **HTTPS Required**
Microphone access requires HTTPS in production. Development may work on localhost.

---

## Support

- **Widget Issues:** Check browser console for errors
- **ElevenLabs API:** Verify API key and agent ID in environment variables
- **Vercel Deployment:** Check build logs in Vercel dashboard

---

## Changelog

### v1.1.0 (Latest)
- ✅ Added iframe postMessage communication
- ✅ Updated dimensions (290x130 collapsed, 460x650 expanded)
- ✅ Fixed position calculations for iframe embedding
- ✅ Enhanced console logging for debugging

### v1.0.0
- Initial release with full conversational AI
- 3D orb animations
- Drag-to-reposition
- Smart expansion direction
- Message copying
- Voice and text support
