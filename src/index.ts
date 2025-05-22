type SwitchName = "twitchAds" | "cookies";

type RequestAction = "writeState" | "readState";

type StateMessage = {
  tabId: number;
  action: RequestAction;
  value?: string;
}

type EventMessage = {
  tabId: number;
  type: SwitchName;
  value: boolean;
}

const Actions = {
  readState: "readState",
  writeState: "writeState",
  sendEvent: "sendEvent"
} as const;

let draftState: State;

async function handleState({
  tabId,
  action,
  value
}: StateMessage) {
  if (action === Actions.readState) {
    const res = await chrome.tabs.sendMessage(tabId, {
      action: action,
      value: value
    });
    return JSON.parse(res.state) as State;
  }

  if (action === Actions.writeState) {
    const res = await chrome.tabs.sendMessage(tabId, {
      action: action,
      value: value
    });
    return res.status;
  }
}

async function sendCustomEvent({
  tabId,
  type,
  value,
}: EventMessage) {
  const res = await chrome.tabs.sendMessage(tabId, {
    action: Actions.sendEvent,
    type: type,
    value: value
  });

  return res;
}


document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Get local state
  if (currentTab && currentTab.id) {
    draftState = await handleState({
      tabId: currentTab.id,
      action: Actions.readState
    });
  }

  const switches = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  switches.forEach(switchElement => {
    const switchName = switchElement.name as SwitchName;
    switchElement.checked = draftState[switchName];

    switchElement.addEventListener('change', async () => {
      const switchName = switchElement.name as SwitchName;
      const switchValue = switchElement.checked;

      draftState[switchName] = switchValue;

      if (currentTab && currentTab.id) {
        await handleState({
          tabId: currentTab.id,
          action: Actions.writeState,
          value: JSON.stringify(draftState)
        });

        await sendCustomEvent({
          tabId: currentTab.id,
          type: switchName,
          value: switchValue
        });
      }
    });
  });
});