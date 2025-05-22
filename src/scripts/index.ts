interface GlobalState {
  isStyleRemoved: boolean;
  isCookiesPopupRemoved: boolean;
  isAdsPopupRemoved: boolean;
  attemptStyle: number;
  attemptCookies: number;
  attemptAds: number;
}

interface LoggerProps {
  type: "logger" | "globalState";
  method?: string;
  element?: HTMLElement;
  [key: string]: any;
}

type Logger = (props: LoggerProps) => void;
type RemoverFunc = (props: { globalState: GlobalState }) => void;

var globalState: GlobalState = {
  isStyleRemoved: false,
  isCookiesPopupRemoved: false,
  isAdsPopupRemoved: false,
  attemptStyle: 1,
  attemptCookies: 1,
  attemptAds: 1,
};

function logger({ type, ...props }: LoggerProps) {
  chrome.runtime.sendMessage({ type, ...props });
}

function getElementIfContainText(text: string) {
  // Filtramos los elementos que contienen el texto y son visibles (display !== 'none')
  const elements = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter(element => 
    element?.textContent?.includes(text) &&
    window.getComputedStyle(element).display !== 'none'
  );

  // Verificamos cuál es el primero que está dentro del viewport
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (
      rect.top >= 0 && rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    ) {
      // Devuelve el primer elemento que está completamente dentro del viewport
      return element;
    }
  }

  // Si no hay ningún elemento en el viewport, devolvemos undefined
  return undefined;
}

function removeStyleBody({ globalState }: { globalState: GlobalState }) {
  if (!document.body) {
    globalState.isStyleRemoved = false;
    return false;
  }
  document.body.style.overflow = "auto !important";
  globalState.isStyleRemoved = true;
  return true;
}

function removeCookiesPopup({ globalState } : { globalState: GlobalState }) {
  const element = getElementIfContainText(" cookies");
  logger({ type: "logger", method: "removeCookiesPopup", hasElement: !!element, element });

  if(!element) {
    globalState.isCookiesPopupRemoved = false;
    return false;
  }

  element.remove();

  globalState.isCookiesPopupRemoved = true;
  return true;
}

function removeAdsPopup({ globalState } : { globalState: GlobalState }) {
  const element = getElementIfContainText("bloqueador de anuncios");
  logger({ type: "logger", method: "removeAdsPopup", hasElement: !!element, element });

  if(!element) {
    globalState.isAdsPopupRemoved = false;
    return false;
  }

  element.remove();

  globalState.isAdsPopupRemoved = true;
  return true;
}

while(!globalState.isCookiesPopupRemoved && globalState.attemptCookies <= 3) {
  const isRemoved = removeCookiesPopup({ globalState });
  if(isRemoved) {
    const isStyleRemoved = removeStyleBody({ globalState });
    logger({ type: "logger", method: "while", isStyleRemoved });
  }
  globalState.attemptCookies++;
}

while(!globalState.isAdsPopupRemoved && globalState.attemptAds <= 3) {
  const isRemoved = removeAdsPopup({ globalState });
  if (isRemoved) {
    const isStyleRemoved = removeStyleBody({ globalState });
    logger({ type: "logger", method: "while", isStyleRemoved });
  }
  globalState.attemptAds++;
}

logger({ type: "globalState", globalState });
