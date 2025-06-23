const log = {
  debug: (message: string, ...data: Array<any>) => console.log('\x1b[90m%s\x1b[0m', message, ...data),
  info: (message: string, ...data: Array<any>) => console.log('\x1b[32m%s\x1b[0m', message, ...data),
  warn: (message: string, ...data: Array<any>) => console.warn('\x1b[33m%s\x1b[0m', message, ...data),
  error: (message: string, ...data: Array<any>) => console.log('\x1b[31m%s\x1b[0m', message, ...data),
} as const;

function deleteTwitchAdOverlay() {
  try {
    const closeBtn = document.querySelector<HTMLElement>(".player-overlay-background > div > div > button");
    if (closeBtn) {
      closeBtn.click();
      log.debug("Elemento cerrado", { closeBtn });
    }
  } catch (error) {
    log.error("Error al clickear elemento cerrar overlay:", { error });
  }
}

function deleteTwitchAdsBanner() {
  try {
    const elementAd = document.querySelector<HTMLElement>(".stream-display-ad__container_lower-third");
    const elementVideo = document.querySelector<HTMLElement>("[data-a-target='video-ref']");
    const elementContainerVideo = document.querySelector<HTMLElement>("[data-a-player-state]");

    if (elementAd && elementVideo && elementContainerVideo) {
      log.debug("Banner eliminado.", { elementAd, elementVideo, elementContainerVideo });

      elementVideo.style.setProperty("width", "100%", "important");
      elementVideo.style.setProperty("height", "100%", "important");

      elementContainerVideo.style.setProperty("width", "100%", "important");
      elementContainerVideo.style.setProperty("height", "100%", "important");

      elementAd.style.setProperty("display", "none", "important");
      elementAd.style.setProperty("height", "0", "important");
      elementAd.style.setProperty("width", "0", "important");
    }
  } catch (error) {
    log.error("Error al eliminar elemento Ad banner:", { error });
  }
}


interface PropsNewMutationObserver {
  callback: Function;
  mutationType: MutationRecordType;
  delay?: number;
  limit?: number;
}

function newMutationObserver({
  callback,
  mutationType,
  delay,
  // limit
}: PropsNewMutationObserver) {
  log.debug("newMutationObserver", { callback, mutationType, delay });
  // let executionCount = 0;

  return new MutationObserver((mutationsList, obs) => {
    const hasMutation = mutationsList.some((mutation) => mutation.type === mutationType && (mutation.addedNodes.length > 0));
    if (!hasMutation) {
      return;
    }

    // log.info({ executionCount, limit, callback });
    // if(limit && executionCount > limit) {
    //   log.info(`Se ha desconectado el observer luego de superar las ${limit} execuciones.`);
    //   obs.disconnect();
    //   return;
    // }

    // executionCount++;

    if (delay) {
      setTimeout(callback, delay);
    } else {
      callback();
    }
  });
}


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
if (main) {
  twitchAdsObserver.observe(main, { childList: true, subtree: true });
  twitchAdsBannerObserver.observe(main, { childList: true, subtree: true });
}

