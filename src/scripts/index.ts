function deleteTwitchAdOverlay() {
  try {
    const closeBtn = document.querySelector<HTMLElement>(".player-overlay-background > div > div > button");
    if (closeBtn) {
      closeBtn.click();
      console.log("Elemento cerrado", { closeBtn });
    }
  } catch (error) {
    console.error("Error al clickear elemento cerrar overlay:", { error });
  }
}

function deleteTwitchAdsBanner() {
  try {
    const elementAd = document.querySelector<HTMLElement>(".stream-display-ad__container_lower-third");
    const elementVideo = document.querySelector<HTMLElement>("[data-a-target='video-ref']");
    const elementContainerVideo = document.querySelector<HTMLElement>("[data-a-player-state]");

    if (elementAd && elementVideo && elementContainerVideo) {
      console.log("Banner eliminado.", { elementAd, elementVideo, elementContainerVideo });

      elementVideo.style.setProperty("width", "100%", "important");
      elementVideo.style.setProperty("height", "100%", "important");

      elementContainerVideo.style.setProperty("width", "100%", "important");
      elementContainerVideo.style.setProperty("height", "100%", "important");

      elementAd.style.setProperty("display", "none", "important");
      elementAd.style.setProperty("height", "auto", "important");
      elementAd.style.setProperty("width", "auto", "important");
    }
  } catch (error) {
    console.error("Error al eliminar elemento Ad banner:", { error });
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
  limit
}: PropsNewMutationObserver) {
  console.log("newMutationObserver", { callback, mutationType, delay });
  let executionCount = 0;

  return new MutationObserver((mutationsList, obs) => {
    const hasMutation = mutationsList.some((mutation) => mutation.type === mutationType && (mutation.addedNodes.length > 0));
    if (!hasMutation) {
      return;
    }

    if(limit && executionCount >= limit) {
      console.log(`"Se ha desconectado el observer luego de superar las ${limit} execuciones.`);
      obs.disconnect();
      return;
    }

    executionCount++;

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
  console.log("Se ha desconectado el observer de twitch ads");

  twitchAdsBannerObserver.disconnect();
  console.log("Se ha desconectado el observer de twitch ads banner");
}

twitchAdsObserver.observe(document.body, { childList: true, subtree: true });
twitchAdsBannerObserver.observe(document.body, { childList: true, subtree: true });
