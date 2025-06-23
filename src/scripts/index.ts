import {
  deleteTwitchAdOverlay,
  deleteTwitchAdsBanner,
  newMutationObserver,
  log
} from "./methods.ts";


const twitchAdsObserver = newMutationObserver({
  callback: deleteTwitchAdOverlay,
  mutationType: "childList"
});

const twitchAdsBannerObserver = newMutationObserver({
  callback: deleteTwitchAdsBanner,
  mutationType: "childList",
  limit: 3
});

if (!window.location.origin.includes("twitch.tv")) {
  twitchAdsObserver.disconnect();
  log.debug("Se ha desconectado el observer de twitch ads");

  twitchAdsBannerObserver.disconnect();
  log.debug("Se ha desconectado el observer de twitch ads banner");
}

const [main] = document.getElementsByTagName("main");

twitchAdsObserver.observe(main, { childList: true, subtree: true });
twitchAdsBannerObserver.observe(main, { childList: true, subtree: true });
