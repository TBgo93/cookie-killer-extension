type SwitchName = "cookies";

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
  const checkboxSwitch = document.querySelector<HTMLInputElement>('input[type="checkbox"]') as HTMLInputElement;

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
    checkboxSwitch.disabled = true;

    return;
  }

  // Get local state
  draftState = await handleState({
    tabId: tabId,
    action: Actions.readState
  });

  const switchName = checkboxSwitch.name as SwitchName;
  checkboxSwitch.checked = draftState[switchName];

  checkboxSwitch.addEventListener('change', async () => {
    const switchName = checkboxSwitch.name as SwitchName;
    const switchValue = checkboxSwitch.checked;

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