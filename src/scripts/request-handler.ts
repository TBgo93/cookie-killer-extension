interface State {
  twitchAds: boolean;
  cookies: boolean;
};

type EventType = keyof State

const STATE_KEY = "cookieKillerState";
const DEFAULT_STATE = { twitchAds: false, cookies: false };
let storedState: State = DEFAULT_STATE;

const state = localStorage.getItem(STATE_KEY);
if (state) {
  storedState = JSON.parse(state);
} else {
  localStorage.setItem(STATE_KEY, JSON.stringify(DEFAULT_STATE));
}

chrome.runtime.onMessage.addListener(
  (request, _sender, sendResponse) => {
    const { action } = request;

    if (action === "writeState") {
      const parsedValue: Partial<State> = JSON.parse(request.value);
      storedState = {
        ...storedState,
        ...parsedValue
      }

      localStorage.setItem(STATE_KEY, JSON.stringify(storedState));
      sendResponse({ status: "201" });
    } 

    if (action === "readState") {
      const state = localStorage.getItem(STATE_KEY);
      sendResponse({ state: state });
    }

    if (action === "sendEvent") {
      const type = request.type as EventType;
      const value = request.value as boolean;

      if (type === "twitchAds") {
        executeCleanTwitchAds({ isActive: value });
      }
      if (type === "cookies") {
        console.log("Not implemented yet");
      }
    }
  }
);

// Functions
interface PropsFn {
  isActive: boolean;
}

function executeCleanTwitchAds({ isActive }: PropsFn) {
  const observer = new MutationObserver((mutationsList) => {
    const hasMutation = mutationsList.some((mutation) => mutation.type === "childList" && (mutation.addedNodes.length > 0));
    if (hasMutation) {
      try {
        const elementAd = document.querySelector<HTMLElement>(".stream-display-ad__container_lower-third");
        const elementVideo = document.querySelector<HTMLElement>("[data-a-target='video-ref']");
        if (elementAd && elementVideo) {
          console.log("Anuncio eliminado.", { elementAd });
          // elementAd.remove();
          elementVideo.style.width = "100% important";
          elementVideo.style.height = "100% important";
          elementAd.style.display = "none !important";
        }
      } catch (error) {
        console.error("Error al eliminar elemento Ad:", error);
      }

      try {
        const elementOverlay = document.querySelector<HTMLElement>(".player-overlay-background");
        if (elementOverlay) {
          console.log("Overlay eliminado.", { elementOverlay });
          elementOverlay.remove();
          // Not working because some JS update display property
          // elementOverlay.style.display = "none";
        }
      } catch (error) {
        console.error("Error al eliminar elemento Overlay:", error);
      }
    }
    // for (const mutation of mutationsList) {
    //   if (mutation.type === 'childList' && (mutation.addedNodes.length > 0)) {
    //   }
    // }
  });
  if (isActive) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
}