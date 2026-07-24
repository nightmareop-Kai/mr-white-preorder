const form = document.querySelector("#reservation-form");
const errorMessage = document.querySelector("#form-error");
const dialog = document.querySelector("#reservation-dialog");
const dialogMessage = document.querySelector("#dialog-message");
const reservationId = document.querySelector("#reservation-id");
const dialogClose = document.querySelector("#dialog-close");
const dialogConfirm = document.querySelector("#dialog-confirm");
const deckSlides = Array.from(document.querySelectorAll("[data-mobile-slide]"));
const deckBack = document.querySelector("#deck-back");
const deckNext = document.querySelector("#deck-next");
const deckCurrent = document.querySelector("#deck-page-current");
const deckTotal = document.querySelector("#deck-page-total");
const deckLabel = document.querySelector("#deck-page-label");
const mobileDeckQuery = window.matchMedia("(max-width: 760px), (orientation: landscape) and (max-height: 520px)");
const storageKey = "mrWhiteFirstDropReservation";
let activeDeckIndex = Math.max(0, deckSlides.findIndex((slide) => slide.classList.contains("is-active")));

function createReservationId() {
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MW-001-${stamp}${random}`;
}

function closeDialog() {
  if (dialog.open) dialog.close();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  if (!form.checkValidity()) {
    errorMessage.textContent = "请补全必填信息，并确认首批联系授权。";
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const reservation = {
    id: createReservationId(),
    name: data.get("name"),
    contactMethod: data.get("contactMethod"),
    contact: data.get("contact"),
    style: data.get("style"),
    interests: data.getAll("interest"),
    createdAt: new Date().toISOString(),
    prototypeOnly: true,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(reservation));
  } catch (error) {
    // The prototype can still complete when browser storage is unavailable.
  }

  reservationId.textContent = reservation.id;
  dialogMessage.textContent = `${reservation.name}，你选择的是 ${reservation.style}。这份预订信息已保存在当前浏览器中；支付仅为页面演示，未产生任何真实扣款。`;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");

  form.reset();
  form.querySelector('input[value="BLACK HOODIE + HEADPHONES"]').checked = true;
  form.querySelector('input[value="BASE BODY"]').checked = true;
});

dialogClose.addEventListener("click", closeDialog);
dialogConfirm.addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

function getDeckSlideId(slide) {
  return slide.id || slide.dataset.mobileId || "";
}

function findDeckIndex(targetId) {
  return deckSlides.findIndex((slide) => getDeckSlideId(slide) === targetId);
}

function showDeckPage(index, updateHash = false) {
  if (!mobileDeckQuery.matches || !deckSlides.length) return;

  activeDeckIndex = Math.min(Math.max(index, 0), deckSlides.length - 1);
  deckSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeDeckIndex);
    slide.classList.toggle("is-before", slideIndex < activeDeckIndex);
  });

  const activeSlide = deckSlides[activeDeckIndex];
  activeSlide.scrollTop = 0;
  window.scrollTo(0, 0);
  deckBack.disabled = activeDeckIndex === 0;
  deckNext.disabled = activeDeckIndex === deckSlides.length - 1;
  deckCurrent.textContent = String(activeDeckIndex + 1).padStart(2, "0");
  deckTotal.textContent = String(deckSlides.length).padStart(2, "0");
  deckLabel.textContent = activeSlide.dataset.mobileLabel || "MR WHITE";

  if (updateHash) {
    const targetId = getDeckSlideId(activeSlide);
    if (targetId) history.replaceState(null, "", `#${targetId}`);
  }
}

function syncMobileDeck() {
  if (!mobileDeckQuery.matches) {
    deckSlides.forEach((slide) => slide.classList.remove("is-before"));
    return;
  }

  const requestedId = window.location.hash.replace("#", "");
  const requestedIndex = requestedId ? findDeckIndex(requestedId) : -1;
  showDeckPage(requestedIndex >= 0 ? requestedIndex : activeDeckIndex);
}

deckBack.addEventListener("click", () => showDeckPage(activeDeckIndex - 1, true));
deckNext.addEventListener("click", () => showDeckPage(activeDeckIndex + 1, true));

document.querySelectorAll("[data-deck-target]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!mobileDeckQuery.matches) return;
    const targetIndex = findDeckIndex(link.dataset.deckTarget);
    if (targetIndex < 0) return;
    event.preventDefault();
    showDeckPage(targetIndex, true);
  });
});

window.addEventListener("hashchange", () => {
  if (!mobileDeckQuery.matches) return;
  const targetIndex = findDeckIndex(window.location.hash.replace("#", ""));
  if (targetIndex >= 0) showDeckPage(targetIndex);
});

window.addEventListener("keydown", (event) => {
  const tagName = event.target.tagName;
  if (!mobileDeckQuery.matches || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tagName)) return;
  if (event.key === "ArrowLeft") showDeckPage(activeDeckIndex - 1, true);
  if (event.key === "ArrowRight") showDeckPage(activeDeckIndex + 1, true);
});

if (mobileDeckQuery.addEventListener) {
  mobileDeckQuery.addEventListener("change", syncMobileDeck);
} else {
  mobileDeckQuery.addListener(syncMobileDeck);
}

syncMobileDeck();
