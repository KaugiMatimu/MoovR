import React from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import useNotificationSound from "../../hooks/useNotificationSound";

/**
 * Notification Sound Settings Component
 * Allows users to control notification sound preferences
 */
export const NotificationSoundSettings = () => {
  const { isMuted, volume, toggleMute, setNotificationVolume, playTestSound } =
    useNotificationSound();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notification Sounds
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control notification audio feedback
          </p>
        </div>
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-all ${
            isMuted
              ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              : "bg-primaryPurple text-white"
          }`}
          aria-label={isMuted ? "Unmute notifications" : "Mute notifications"}
        >
          {isMuted ? (
            <VolumeX size={20} />
          ) : volume > 0.5 ? (
            <Volume2 size={20} />
          ) : (
            <Volume1 size={20} />
          )}
        </button>
      </div>

      {!isMuted && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => setNotificationVolume(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primaryPurple"
              aria-label="Notification volume"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Test Sounds:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => playTestSound("notification")}
                className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
              >
                Regular
              </button>
              <button
                onClick={() => playTestSound("rideRequest")}
                className="py-2 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
              >
                Ride Request
              </button>
              <button
                onClick={() => playTestSound("emergency")}
                className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
              >
                Emergency
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Emergency notifications will always play a sound when received, even if
              notifications are muted
            </p>
          </div>
        </div>
      )}

      {isMuted && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            ⚠️ Notification sounds are currently muted. Emergency alerts will still display
            visual notifications.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSoundSettings;
