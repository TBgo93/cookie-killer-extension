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
  const switches = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

  // Get current tab
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!currentTab) {
    return;
  }
  if (!currentTab.id) {
    return;
  }

  const { id: tabId, url: tabUrl } = currentTab;

  // Validation if is chrome:// url
  if (tabUrl?.includes("chrome://")) {
    switches.forEach(element => {
      element.disabled = true;
    });

    return;
  }

  // Get local state
  draftState = await handleState({
    tabId: tabId,
    action: Actions.readState
  });

  if (!tabUrl?.includes("twitch.tv")) {
    const input = document.querySelector<HTMLInputElement>('input[name="twitchAds"]')!;
    input.checked = false;
    input.disabled = true;
  }

  switches.forEach(input => {
    const switchName = input.name as SwitchName;
    input.checked = draftState[switchName];

    input.addEventListener('change', async () => {
      const switchName = input.name as SwitchName;
      const switchValue = input.checked;

      draftState[switchName] = switchValue;

      await handleState({
        tabId: tabId,
        action: Actions.writeState,
        value: JSON.stringify(draftState)
      });

      await sendCustomEvent({
        tabId: tabId,
        type: switchName,
        value: switchValue
      });

    });
  });
});