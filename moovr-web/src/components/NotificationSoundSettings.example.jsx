/**
 * Example: How to Add Notification Sound Settings to Your Profile Page
 * 
 * This example shows how to integrate the NotificationSoundSettings component
 * into an existing profile or settings page.
 */

import React from "react";
import NotificationSoundSettings from "../components/NotificationSoundSettings";
import { useNotifications } from "../context/NotificationProvider";
import useNotificationSound from "../hooks/useNotificationSound";

/**
 * Example 1: Simple Integration into Profile Page
 */
export function ProfilePageExample() {
  return (
    <div className="space-y-8">
      {/* Existing profile sections */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        {/* Your profile content here */}
      </section>

      {/* Add notification sounds section */}
      <section>
        <NotificationSoundSettings />
      </section>

      {/* Other settings */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Privacy</h3>
        {/* Privacy settings here */}
      </section>
    </div>
  );
}

/**
 * Example 2: Settings with Notification Preview
 */
export function AdvancedSettingsPageExample() {
  const { notifications, unreadCount } = useNotifications();
  const { playTestSound } = useNotificationSound();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main settings column */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold">Notification Settings</h2>

        {/* Notification Sounds */}
        <NotificationSoundSettings />

        {/* Other settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Emergency alerts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Ride requests</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Order updates</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar with notification preview */}
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📢 Preview
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You have <strong>{unreadCount}</strong> unread notifications.
            </p>
            <button
              onClick={() => playTestSound("notification")}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
            >
              Test Sound
            </button>
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Recent</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif._id} className="text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="font-medium text-gray-900 dark:text-white">
                  {notif.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Minimal Integration (Just the Settings)
 */
export function MinimalSettingsPageExample() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <NotificationSoundSettings />
    </main>
  );
}

/**
 * Example 4: Custom Notification Sound Control
 * If you prefer to build your own UI instead of using NotificationSoundSettings
 */
export function CustomNotificationControlExample() {
  const { isMuted, volume, toggleMute, setNotificationVolume, playTestSound } =
    useNotificationSound();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm max-w-md">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        {isMuted ? "🔇" : "🔊"} Notification Sounds
      </h2>

      <div className="space-y-4">
        {/* Mute Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Enable Sounds</span>
          <button
            onClick={toggleMute}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              !isMuted ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                !isMuted ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Volume Control */}
        {!isMuted && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">Volume</label>
              <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => setNotificationVolume(parseInt(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        )}

        {/* Test Buttons */}
        {!isMuted && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Test Sounds:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => playTestSound("notification")}
                className="py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
              >
                Regular
              </button>
              <button
                onClick={() => playTestSound("rideRequest")}
                className="py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
              >
                Ride
              </button>
              <button
                onClick={() => playTestSound("emergency")}
                className="py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
              >
                Emergency
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Settings in a Tab Layout
 */
export function TabLayoutSettingsExample() {
  const [activeTab, setActiveTab] = React.useState("notifications");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === "notifications"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === "privacy"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            🔒 Privacy
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === "account"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            👤 Account
          </button>
        </div>
      </div>

      <div className="py-8">
        {activeTab === "notifications" && <NotificationSoundSettings />}
        {activeTab === "privacy" && <div>Privacy settings here</div>}
        {activeTab === "account" && <div>Account settings here</div>}
      </div>
    </div>
  );
}
