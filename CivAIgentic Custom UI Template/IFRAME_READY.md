# 🎉 Jacky 2.0 Widget - Ready for Iframe Integration!

## ✅ What's Been Updated

1. **postMessage Communication** - Widget now sends messages to parent iframe:
   - `widgetExpanded` - When user clicks to expand
   - `widgetCollapsed` - When user clicks to collapse

2. **Updated Dimensions**:
   - Collapsed: 260px × 130px (button only)
   - Expanded: 430px × 620px (full chat)
   - Iframe sizes: 290px × 130px → 460px × 650px (with padding)

3. **Position Calculations** - Updated for new dimensions
4. **Console Logging** - Added for debugging postMessage events

---

## 🚀 Production URL

Your widget is live at:
```
https://elevenlabs-nextjs-ip9mgh85x-steven-sierra-alcabes-projects.vercel.app/widget
```

---

## 📋 Complete Integration Code

Copy and paste this into any webpage:

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
    if (event.origin === 'https://elevenlabs-nextjs-l4j2z5c84-steven-sierra-alcabes-projects.vercel.app') {
      var iframe = document.getElementById('jacky-widget');
      
      if (event.data.type === 'widgetExpanded') {
        // Expand iframe to show full widget
        iframe.style.width = '460px';
        iframe.style.height = '670px';
        console.log('Widget expanded');
      } else if (event.data.type === 'widgetCollapsed') {
        // Collapse iframe back to button size
        iframe.style.width = '290px';
        iframe.style.height = '150px';
        console.log('Widget collapsed');
      }
    }
  });
</script>
```

---

## 🧪 Test the Integration

1. Open `test-widget-iframe.html` in a browser
2. You'll see a test page with live status indicators
3. Click the widget button in the bottom-left
4. Watch the status update in real-time
5. Check browser console for postMessage logs

---

## 📱 Widget Features

✅ **Voice & Text Chat** - Talk or type with Jacky
✅ **3D Animated Orb** - WebGL-powered with pulse effects
✅ **Drag-to-Reposition** - Move anywhere on screen
✅ **Smart Expansion** - Opens upward/downward based on position
✅ **Message Copying** - One-click copy for any message
✅ **Position Memory** - Remembers location across page loads
✅ **Status Indicators** - Visual feedback for connection state
✅ **Shimmer Text** - Animated title and subtitle
✅ **Responsive** - Adapts to iframe constraints

---

## 🔧 Customization

### Different Position

```html
<!-- Bottom right -->
<div id="jacky-widget-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">

<!-- Top right -->
<div id="jacky-widget-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
```

### Custom Domain

If you add a custom domain in Vercel:

1. Update iframe `src`:
```html
<iframe src="https://your-domain.com/widget" ...>
```

2. Update event origin check:
```javascript
if (event.origin === 'https://your-domain.com') {
```

---

## 📊 Message Flow

```
┌─────────────┐                    ┌─────────────┐
│   Parent    │                    │   Widget    │
│   Webpage   │                    │   (Iframe)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │     1. User clicks expand        │
       │◄─────────────────────────────────┤
       │   postMessage('widgetExpanded')  │
       │                                  │
       │     2. Parent resizes iframe     │
       │      to 460px × 650px            │
       ├──────────────────────────────────►
       │                                  │
       │     3. User clicks collapse      │
       │◄─────────────────────────────────┤
       │   postMessage('widgetCollapsed') │
       │                                  │
       │     4. Parent resizes iframe     │
       │      to 290px × 130px            │
       └──────────────────────────────────►
```

---

## 🐛 Debugging

### Check Console Messages

The widget logs these events:
```
✅ Sent message to parent: widgetExpanded
✅ Sent message to parent: widgetCollapsed
```

The parent page logs:
```
✅ Widget expanded
✅ Widget collapsed
```

### Common Issues

**Widget not resizing?**
- Check event.origin matches exactly
- Ensure script runs after iframe loads
- Look for console errors

**Microphone not working?**
- Page must be HTTPS (or localhost)
- Check browser permissions
- Verify `allow="microphone"` attribute

**Widget position wrong?**
- Adjust container div position
- Check z-index conflicts
- Verify no CSS overrides

---

## 📚 Documentation Files

- `IFRAME_INTEGRATION.md` - Complete integration guide
- `test-widget-iframe.html` - Live test page
- `DEPLOYMENT.md` - Vercel deployment guide
- `README.md` - Project overview

---

## 🎯 Next Steps

1. **Test locally** - Open `test-widget-iframe.html`
2. **Deploy to your site** - Copy the integration code
3. **Customize position** - Adjust container styling
4. **Add custom domain** (optional) - Configure in Vercel
5. **Monitor usage** - Check Vercel analytics

---

## 🎊 You're All Set!

Your Jacky 2.0 widget is now:
- ✅ Deployed to production
- ✅ Configured for iframe embedding
- ✅ Communicating via postMessage
- ✅ Ready to integrate anywhere

Just copy the integration code and paste it into any webpage! 🚀
