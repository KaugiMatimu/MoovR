/**
 * Notification Sound Service
 * Handles playing notification sounds with different types
 */

class NotificationSoundService {
  constructor() {
    this.audioContext = null;
    this.soundCache = {};
    this.isMuted = false;
    this.volume = 0.7;

    // Initialize audio context
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !this.audioContext) {
        this.audioContext = new AudioContext();
      }
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  /**
   * Generate a beep sound using Web Audio API
   * Fallback for devices without notification sound files
   */
  playBeep(frequency = 800, duration = 300, type = "sine") {
    try {
      if (!this.audioContext) return;

      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (error) {
      console.error("Error playing beep:", error);
    }
  }

  /**
   * Play a complex notification sound (notification pattern)
   */
  playNotificationSound() {
    // Play a pleasant notification pattern
    this.playBeep(600, 150);
    setTimeout(() => this.playBeep(800, 150), 200);
  }

  /**
   * Play urgent emergency sound (different pattern)
   */
  playEmergencySound() {
    // Urgent pattern: high-low-high
    this.playBeep(1000, 100);
    setTimeout(() => this.playBeep(600, 100), 150);
    setTimeout(() => this.playBeep(1000, 100), 300);
  }

  /**
   * Play ride request sound (cheerful pattern)
   */
  playRideRequestSound() {
    // Cheerful ascending pattern
    this.playBeep(523, 100); // C
    setTimeout(() => this.playBeep(659, 100), 120); // E
    setTimeout(() => this.playBeep(784, 100), 240); // G
  }

  /**
   * Play generic notification sound
   */
  play(type = "notification") {
    if (this.isMuted) return;

    try {
      // Resume audio context if needed
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      switch (type) {
        case "emergency":
          this.playEmergencySound();
          break;
        case "rideRequest":
        case "newRide":
          this.playRideRequestSound();
          break;
        default:
          this.playNotificationSound();
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("notificationMuted", this.isMuted);
    return this.isMuted;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("notificationVolume", this.volume);
  }

  /**
   * Get current mute status
   */
  isSoundMuted() {
    return this.isMuted;
  }

  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    const muted = localStorage.getItem("notificationMuted");
    const volume = localStorage.getItem("notificationVolume");

    if (muted !== null) {
      this.isMuted = muted === "true";
    }

    if (volume !== null) {
      this.volume = parseFloat(volume);
    }
  }

  /**
   * Request permission for notifications (for supported browsers)
   */
  async requestPermission() {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return true;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title, options = {}) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          icon: "/images/logo.png",
          badge: "/images/logo.png",
          ...options,
        });
      } catch (error) {
        console.error("Error showing browser notification:", error);
      }
    }
  }
}

// Create singleton instance
export const notificationSoundService = new NotificationSoundService();

// Load preferences on initialization
notificationSoundService.loadPreferences();

export default notificationSoundService;
