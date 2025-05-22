// // State icon
// const ON_VALUE = {
//   Text: "ON",
//   Color: "#000000",
//   BackgroundColor: "#AEE000"
// };
// const OFF_VALUE = {
//   Text: "OFF",
//   Color: "#FFFFFF",
//   BackgroundColor: "#CE0000"
// }

// const INITIAL_STATE = {
//   IconText: OFF_VALUE.Text,
//   BackgroundColor: OFF_VALUE.BackgroundColor,
//   Color: OFF_VALUE.Color
// };

const ERROR_URL_EXTENSION = "Cannot access a chrome:// URL";
const REQUEST_TYPES = ["removeAdsPopup", "removeCookiesPopup", "logger", "globalState"];
const TABS_STATE: Array<number> = [];
const log = {
  debug: (message: string, ...data: Array<any>) => console.log('\x1b[90m%s\x1b[0m', message, ...data),
  info: (message: string, ...data: Array<any>) => console.log('\x1b[32m%s\x1b[0m', message, ...data),
  warn: (message: string, ...data: Array<any>) => console.warn('\x1b[33m%s\x1b[0m', message, ...data),
  error: (message: string, ...data: Array<any>) => console.log('\x1b[31m%s\x1b[0m', message, ...data),
}

const { runtime, scripting, tabs } = chrome;


// API de Chrome
// const { 
//   getBadgeText,
//   setBadgeText,
//   setBadgeTextColor,
//   setBadgeBackgroundColor
// } = action;

// // Init state icon
// setBadgeText({
//   text: INITIAL_STATE.IconText,
// });
// setBadgeBackgroundColor({
//   color: INITIAL_STATE.BackgroundColor
// });
// setBadgeTextColor({
//   color: INITIAL_STATE.Color
// });

// Listener de instalación
runtime.onInstalled.addListener(async () => {
  log.debug("Service worker installed")
});

// Logs
runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (REQUEST_TYPES.includes(request.type)) {
    log.info(request);
    return true;
  }
})

// Inject script
tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const hasTab = TABS_STATE.includes(tabId);
  if (!hasTab && changeInfo.status === 'complete') {
    TABS_STATE.push(tabId);
    log.info("tabs.onUpdated.addListener", { TABS_STATE, tabId, changeInfo, tab });

    try {
      await scripting.executeScript({
        target: {
          tabId: tabId
        },
        files: ["scripts/index.js"],
      });
    } catch (error) {
      const { message } = error as Error;
      if(message !== ERROR_URL_EXTENSION) {
        log.warn("tabs.onUpdated.addListener", { error });
      }
    } finally {
      log.info("tabs.onUpdated.addListener", "Script executed");
    }
  }
});

tabs.onRemoved.addListener((tabId) => {
  const index = TABS_STATE.indexOf(tabId);
  if (index > -1) {
    TABS_STATE.splice(index, 1);
    log.info("tabs.onRemoved.addListener", { TABS_STATE, tabId });
  } else {
    log.error("tabs.onRemoved.addListener", { tabId });
  }
});


// function _getTabStateById({ tabId }) {
//   const keysTabsState = Object.keys(TABS_STATE);
//   const stateTab = keysTabsState.find((key) => Number(key) === tabId);

//   if (!stateTab) {
//     TABS_STATE[tabId] = {
//       iconText: INITIAL_STATE.IconText,
//       backgroundColor: INITIAL_STATE.BackgroundColor,
//       color: INITIAL_STATE.Color,
//     };
//   }

//   return TABS_STATE[tabId];
// }

// function manageStateIcon({ tabId }) {
//   const state = _getTabStateById({ tabId });

//   if (state.iconText === ON_VALUE.Text) {
//     state.iconText = OFF_VALUE.Text;
//     state.backgroundColor = OFF_VALUE.BackgroundColor;
//     state.color = OFF_VALUE.Color;
//   } else {
//     state.iconText = ON_VALUE.Text;
//     state.backgroundColor = ON_VALUE.BackgroundColor;
//     state.color = ON_VALUE.Color;
//   }

//   setBadgeTextColor({
//     tabId,
//     color: state.color
//   });
//   setBadgeBackgroundColor({
//     tabId,
//     color: state.backgroundColor
//   });
//   setBadgeText({
//     tabId,
//     text: state.iconText,
//   });

//   return state;
// }