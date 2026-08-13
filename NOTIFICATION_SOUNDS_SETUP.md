# Notification Sounds - Integration Guide

## Quick Start

The notification sounds feature is fully implemented and ready to use. It automatically plays audio feedback when notifications arrive.

## What Was Added

### 1. Automatic Sound Playback ✅
- Emergency alerts play urgent sound pattern
- Ride requests play cheerful ascending pattern  
- Regular notifications play pleasant two-tone pattern
- All sounds play in real-time when notifications arrive via Socket.io

### 2. User Settings Component ✅
A new `NotificationSoundSettings.jsx` component allows users to:
- Mute/unmute notifications
- Adjust volume (0-100%)
- Test each sound type
- View current settings

### 3. Web Audio API Service ✅
`notificationSoundService.js` handles all sound generation:
- No external audio files (procedural generation)
- Cross-browser compatible
- Handles browser autoplay policies
- Persists user preferences to localStorage

## How to Add Settings to Your UI

### Option 1: Add to Profile/Settings Page
```jsx
import NotificationSoundSettings from "../components/NotificationSoundSettings";

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <h2>Profile Settings</h2>
      
      {/* Add the settings component */}
      <NotificationSoundSettings />
      
      {/* Other settings... */}
    </div>
  );
}
```

### Option 2: Add to a Modal/Sidebar
```jsx
import NotificationSoundSettings from "../components/NotificationSoundSettings";

export function SettingsModal() {
  return (
    <div className="modal">
      <div className="modal-header">Settings</div>
      <div className="modal-body">
        <NotificationSoundSettings />
      </div>
    </div>
  );
}
```

### Option 3: Use the Hook Directly
If you want to build your own UI:
```jsx
import useNotificationSound from "../hooks/useNotificationSound";

export function CustomNotificationSettings() {
  const { isMuted, volume, toggleMute, setNotificationVolume, playTestSound } = 
    useNotificationSound();

  return (
    <div>
      <button onClick={toggleMute}>
        {isMuted ? "🔇 Unmute" : "🔊 Mute"}
      </button>
      
      <input 
        type="range"
        min="0"
        max="100"
        value={volume * 100}
        onChange={(e) => setNotificationVolume(e.target.value / 100)}
      />
      
      <button onClick={() => playTestSound("emergency")}>Test</button>
    </div>
  );
}
```

## How It Works

### Real-Time Notification Flow
```
Socket.io Event
    ↓
NotificationProvider receives event
    ↓
handleNewNotification() function triggered
    ↓
notificationSoundService.play(type)  ← Sound plays here!
    ↓
Toast notification displayed
    ↓
Notification stored in state
```

### Sound Types Recognized
```
Type                Sound Pattern
────────────────────────────────────
emergencyAlert      1000Hz→600Hz→1000Hz (urgent)
driverEmergency     1000Hz→600Hz→1000Hz (urgent)
newRide             523Hz→659Hz→784Hz (cheerful)
rideRequest         523Hz→659Hz→784Hz (cheerful)
notification        600Hz→800Hz (pleasant)
(default)           600Hz→800Hz (pleasant)
```

## Features

### ✅ Automatic Playback
- Plays when notifications arrive
- No user action needed
- Different sounds for different notification types

### ✅ User Control
- Mute/unmute toggle
- Volume slider
- Test buttons
- Settings persist to localStorage

### ✅ Emergency Handling
- Emergency alerts play urgent sound
- Shows browser notification with `requireInteraction: true`
- Cannot be permanently disabled (but can be muted)

### ✅ Browser Compatibility
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

### ✅ Autoplay Policy Handling
- Handles browser autoplay restrictions gracefully
- Audio context resumes on user interaction
- Fallback to visual notifications if audio blocked

## Testing

### Test in Browser Console
```javascript
// Play different sounds
notificationSoundService.play("notification");
notificationSoundService.play("rideRequest");
notificationSoundService.play("emergency");

// Control settings
notificationSoundService.toggleMute();
notificationSoundService.setVolume(0.5);

// Check current state
console.log(notificationSoundService.isMuted);
console.log(notificationSoundService.volume);
```

### Test Emergency Alert
1. Open a ride as passenger
2. Click emergency button
3. Listen for urgent sound on driver's device
4. Driver should also hear urgent sound

### Test Ride Request
1. As driver, wait for ride requests
2. When ride request arrives, listen for cheerful ascending sound

### Test Muting
1. Open NotificationSoundSettings component
2. Toggle mute button
3. Trigger a notification (should not play)
4. Toggle mute again
5. Trigger notification (should play)

## Storage Details

Preferences saved to localStorage:
```javascript
localStorage.getItem("notificationMuted")  // "true" or "false"
localStorage.getItem("notificationVolume") // "0.7" (as string)
```

Clear preferences to reset to defaults:
```javascript
localStorage.removeItem("notificationMuted");
localStorage.removeItem("notificationVolume");
// Reload page
```

## Performance Impact

- **Zero Network Overhead**: Sounds generated procedurally (no files)
- **Minimal CPU**: Only oscillators run during playback (~10ms)
- **Memory Efficient**: Single audio context reused
- **No External Dependencies**: Uses browser Web Audio API only

## Troubleshooting

### Sound Not Playing
1. Check if muted: `notificationSoundService.isMuted` should be `false`
2. Check volume: `notificationSoundService.volume` should be > 0
3. Check browser autoplay policy - click page and retry
4. Check console for errors: `Ctrl+Shift+J` (Chrome)

### Volume Too Low/High
- Use NotificationSoundSettings component
- Or set directly: `notificationSoundService.setVolume(0.8)`

### Browser Notification Not Showing
1. Check permission: Open browser settings
2. Allow notifications for localhost/app domain
3. May need to request permission first

### Still Not Working?
1. Check browser console for errors
2. Verify Socket.io connection is active
3. Check that notification events are being received
4. Try opening DevTools and checking audio context state

## Next Steps

1. **Locate your profile/settings page** (e.g., `components/UserProfile.jsx`)
2. **Import the component**: 
   ```jsx
   import NotificationSoundSettings from "../components/NotificationSoundSettings";
   ```
3. **Add to your page**:
   ```jsx
   <NotificationSoundSettings />
   ```
4. **Test** by triggering notifications and verifying sounds play

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| notificationSoundService.js | Core sound engine | src/services/ |
| useNotificationSound.js | React hook | src/hooks/ |
| NotificationSoundSettings.jsx | Settings UI | src/components/ |
| NotificationProvider.jsx | Integration point | src/context/ |

## API Reference

### notificationSoundService Methods

```javascript
// Play sound
play(type)              // "notification", "rideRequest", "emergency"

// User preferences
toggleMute()            // Returns new muted state
setVolume(volume)       // 0-1 range
isSoundMuted()          // Get mute status
loadPreferences()       // Load from localStorage

// Browser notifications
showBrowserNotification(title, options)
requestPermission()     // Request notification permission

// Testing
playBeep(freq, duration, type)
playNotificationSound()
playRideRequestSound()
playEmergencySound()
```

### useNotificationSound Hook

```javascript
const {
  isMuted,                    // boolean
  volume,                     // 0-1
  toggleMute,                 // () => boolean
  setNotificationVolume,      // (volume: number) => void
  playTestSound              // (type?: string) => void
} = useNotificationSound();
```

## Feature Documentation
See [NOTIFICATION_SOUNDS.md](./NOTIFICATION_SOUNDS.md) for complete technical documentation.
