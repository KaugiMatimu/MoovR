import { useEffect } from "react";

const usePreventLeave = (active = false) => {
  useEffect(() => {
    if (!active) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "You have an active ride in progress. Are you sure you want to leave?";
      return "You have an active ride in progress. Are you sure you want to leave?";
    };

    const handlePopState = (event) => {
      const confirmLeave = window.confirm(
        "You have an active ride in progress. Leaving this screen may interrupt the ride flow. Do you want to stay on this page?"
      );
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [active]);
};

export default usePreventLeave;
