interface ElementState {
  cookies: boolean;
}
interface State {
  cookies: boolean;
};

type EventType = keyof State

const STATE_KEY = "cookie_killer_state";
const DEFAULT_STATE = {  cookies: false };
let storedState: State = DEFAULT_STATE;
var elementsState = {
  cookies: false
}

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

      if (type === "cookies") {
        console.log("Not implemented yet");
      }
    }
  }
);


function cleanLocalState({ elementsState }: { elementsState: ElementState }) {
  for (const key of Object.keys(elementsState)) {
    const typedKey = key as keyof ElementState;
    elementsState[typedKey] = false;
  }
}