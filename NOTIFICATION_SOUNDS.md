# Notification Sound Feature

## Overview
This feature adds real-time audio feedback to all notifications in the Moovr application. When notifications arrive via Socket.io, different sounds play based on the notification type:
- **Regular Notifications**: Pleasant two-tone notification pattern
- **Ride Requests**: Cheerful ascending pattern (like a doorbell)
- **Emergency Alerts**: Urgent high-low-high pattern

## Architecture

### 1. Notification Sound Service
**File**: `moovr-web/src/services/notificationSoundService.js`

A singleton service that manages all sound-related functionality:
- Uses Web Audio API for cross-browser compatibility
- Generates procedural sounds (no external audio files needed)
- Supports different notification types with unique audio patterns
- Handles browser autoplay policies
- Persists user preferences (muted state, volume) to localStorage

**Key Methods**:
- `play(type)` - Play appropriate sound based on notification type
- `toggleMute()` - Mute/unmute notifications
- `setVolume(volume)` - Set volume (0-1)
- `loadPreferences()` - Restore user preferences from localStorage
- `showBrowserNotification()` - Show native browser notification
- `playBeep(frequency, duration, type)` - Low-level sound generation

### 2. Hook for Component Integration
**File**: `moovr-web/src/hooks/useNotificationSound.js`

React hook that provides notification sound control:
```jsx
const { isMuted, volume, toggleMute, setNotificationVolume, playTestSound } = useNotificationSound();
```

### 3. NotificationProvider Updates
**File**: `moovr-web/src/context/NotificationProvider.jsx`

Enhanced with sound playback:
- Imports `notificationSoundService`
- Added `socket.on("emergencyAlert")` and `socket.on("driverEmergency")` listeners
- Plays appropriate sound in `handleNewNotification()` based on notification type
- Shows browser notifications for emergency and ride request alerts
- Sounds play BEFORE showing toast to ensure audio plays first

**Notification Types Handled**:
- `emergencyAlert` - Passenger emergency (plays emergency sound)
- `driverEmergency` - Driver emergency (plays emergency sound)
- `newRide` / `rideRequest` - Ride requests (plays ride request sound)
- All others - Regular notification sound

### 4. Settings Component
**File**: `moovr-web/src/components/NotificationSoundSettings.jsx`

User interface for controlling notification sounds:
- Toggle mute/unmute
- Volume slider (0-100%)
- Test buttons for each sound type
- Visual feedback showing current state
- Warnings about muted notifications

**Features**:
- Dark mode support
- Responsive design
- Accessible controls (ARIA labels)
- Warning messages for muted state

## Sound Patterns

### Regular Notification
- Tone 1: 600Hz for 150ms
- Pause: 50ms
- Tone 2: 800Hz for 150ms
- Total duration: ~300ms

### Ride Request Sound
- Tone 1: 523Hz (C note) for 100ms
- Tone 2: 659Hz (E note) for 100ms (120ms delay)
- Tone 3: 784Hz (G note) for 100ms (240ms delay)
- Total duration: ~340ms

### Emergency Sound
- Tone 1: 1000Hz for 100ms (urgent high)
- Pause: 50ms
- Tone 2: 600Hz for 100ms (low)
- Pause: 50ms
- Tone 3: 1000Hz for 100ms (high)
- Total duration: ~300ms

## Browser Compatibility

| Browser | Web Audio API | Browser Notification | Status |
|---------|---------------|----------------------|--------|
| Chrome  | ✅ Yes        | ✅ Yes              | Fully Supported |
| Firefox | ✅ Yes        | ✅ Yes              | Fully Supported |
| Safari  | ✅ Yes        | ✅ Yes              | Fully Supported |
| Edge    | ✅ Yes        | ✅ Yes              | Fully Supported |
| Mobile  | ✅ Yes        | ✅ Yes              | Fully Supported |

## Autoplay Policy Handling

Modern browsers require user interaction before playing audio. This implementation handles it by:
1. Attempting to play sound on notification arrival
2. If blocked by autoplay policy, the audio context is suspended
3. User clicking any element on the page resumes the audio context
4. Next notification will play successfully

## Storage & Preferences

User preferences are persisted to localStorage:
```javascript
localStorage.setItem("notificationMuted", true/false);
localStorage.setItem("notificationVolume", 0.7); // Number 0-1
```

Preferences are loaded automatically on service initialization.

## Integration Points

### 1. Real-time Notifications (Socket.io)
When notifications arrive via Socket.io events, the NotificationProvider automatically plays sounds:
```javascript
socket.on("emergencyAlert", (data) => {
  notificationSoundService.play("emergency");
  // ... rest of notification handling
});
```

### 2. Emergency Alerts
Emergency alerts trigger the most urgent sound pattern and show browser notifications with `requireInteraction: true` to ensure users see them.

### 3. Ride Requests
Ride request sounds are cheerful to differentiate them from emergencies but still grab attention.

## Usage Examples

### Using the Hook in a Component
```jsx
import useNotificationSound from "../hooks/useNotificationSound";

export function SettingsPage() {
  const { isMuted, volume, toggleMute, setNotificationVolume, playTestSound } = useNotificationSound();

  return (
    <div>
      <button onClick={toggleMute}>
        {isMuted ? "Unmute" : "Mute"} Notifications
      </button>
      <input 
        type="range" 
        value={volume * 100} 
        onChange={(e) => setNotificationVolume(e.target.value / 100)}
      />
      <button onClick={() => playTestSound("emergency")}>
        Test Emergency Sound
      </button>
    </div>
  );
}
```

### Adding Settings Component
```jsx
import NotificationSoundSettings from "../components/NotificationSoundSettings";

export function ProfilePage() {
  return (
    <div>
      <NotificationSoundSettings />
    </div>
  );
}
```

## Testing

### Test Emergency Sound
```bash
# Open browser console
notificationSoundService.playEmergencySound();
```

### Test Ride Request Sound
```bash
notificationSoundService.playRideRequestSound();
```

### Test Regular Notification
```bash
notificationSoundService.playNotificationSound();
```

### Trigger Real Emergency Alert (Development)
1. Open ride with passenger
2. Click emergency button
3. Listen for emergency sound on driver side

## Performance Considerations

1. **Web Audio API Context**: Created once and reused (singleton pattern)
2. **No External Files**: Sounds are generated procedurally, no network requests
3. **Lazy Initialization**: Audio context only created if needed
4. **Efficient Playback**: Uses oscillators that stop after duration
5. **Memory Management**: Oscillators are cleaned up after each play

## Accessibility

- ARIA labels on all buttons
- Keyboard navigable controls
- Visual feedback for muted state
- Warning messages for important states
- Volume control for users with hearing sensitivities

## Future Enhancements

1. **Custom Sounds**: Allow users to upload custom notification sounds
2. **Different Sounds per Notification Type**: Unique sounds for different events
3. **Haptic Feedback**: Vibration on mobile devices
4. **Sound Categories**: Separate settings for different notification categories
5. **Do Not Disturb**: Time-based muting (e.g., quiet hours 10 PM - 8 AM)
6. **AI-based Volume**: Automatically adjust volume based on ambient noise

## Troubleshooting

### Sound Not Playing
1. Check if notifications are muted in settings
2. Browser autoplay policy may be blocking audio
3. Click anywhere on page to resume audio context
4. Check browser console for errors
5. Ensure volume is not set to 0

### Sound Too Quiet or Loud
- Use the volume slider in NotificationSoundSettings
- Preferences are saved automatically

### Browser Notification Not Showing
1. Check browser notification permissions
2. `Notification.permission` should be "granted"
3. Click "Request Notification Permission" if needed

## Security Considerations

- Audio context is only created on user interaction (browser autoplay policy)
- No external audio files loaded (procedural generation)
- User can always disable sounds via settings
- Emergency notifications cannot be disabled (but can be muted visually)

## Monitoring & Analytics

Consider tracking:
- How many users enable/disable notification sounds
- Which notification type sounds are most frequently heard
- User volume preference distribution
- Browser compatibility issues

## Files Modified/Created

### Created
- `moovr-web/src/services/notificationSoundService.js` - Core sound service
- `moovr-web/src/hooks/useNotificationSound.js` - React hook
- `moovr-web/src/components/NotificationSoundSettings.jsx` - Settings UI

### Modified
- `moovr-web/src/context/NotificationProvider.jsx` - Added sound playback logic

### No Backend Changes Required
- Existing Socket.io events are used as-is
- Emergency controller already sends proper event types
- All audio generation happens client-side

## Related Documentation
- [Emergency Feature Documentation](./EMERGENCY_FEATURE.md)
- [Real-time Notifications](./REALTIME_NOTIFICATIONS.md)
- [Socket.io Integration](./SOCKET_IO_INTEGRATION.md)
