/**
 * Hook for managing notification sound settings
 */

import { useState, useCallback, useEffect } from "react";
import notificationSoundService from "../services/notificationSoundService";

export const useNotificationSound = () => {
  const [isMuted, setIsMuted] = useState(notificationSoundService.isMuted);
  const [volume, setVolume] = useState(notificationSoundService.volume);

  useEffect(() => {
    // Load preferences on mount
    notificationSoundService.loadPreferences();
    setIsMuted(notificationSoundService.isMuted);
    setVolume(notificationSoundService.volume);
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = notificationSoundService.toggleMute();
    setIsMuted(newMutedState);
    return newMutedState;
  }, []);

  const setNotificationVolume = useCallback((newVolume) => {
    notificationSoundService.setVolume(newVolume);
    setVolume(newVolume);
  }, []);

  const playTestSound = useCallback((type = "notification") => {
    notificationSoundService.play(type);
  }, []);

  return {
    isMuted,
    volume,
    toggleMute,
    setNotificationVolume,
    playTestSound,
  };
};

export default useNotificationSound;
